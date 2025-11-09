const mjml2html = require('mjml');
const Handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class EmailTemplateService {
  constructor() {
    this.templatesDir = path.join(__dirname, '../templates');
    this.templateCache = new Map();
  }

  /**
   * Compila template MJML com variáveis Handlebars
   * @param {string} templateName - Nome do arquivo template (sem extensão)
   * @param {Object} variables - Variáveis para substituir no template
   * @returns {Promise<string>} HTML compilado
   */
  async compileTemplate(templateName, variables = {}) {
    try {
      // 1. Ler template MJML
      const mjmlTemplate = await this.loadTemplate(templateName);

      // 2. Compilar variáveis Handlebars
      const compiledMjml = this.compileHandlebars(mjmlTemplate, variables);

      // 3. Converter MJML para HTML
      const { html, errors } = mjml2html(compiledMjml, {
        validationLevel: 'soft',
        minify: false
      });

      if (errors && errors.length > 0) {
        logger.warn(`MJML warnings for template ${templateName}:`, errors);
      }

      return html;
    } catch (error) {
      logger.error(`Error compiling email template ${templateName}:`, error);
      throw new Error(`Failed to compile email template: ${error.message}`);
    }
  }

  /**
   * Carrega template MJML do disco
   * @param {string} templateName
   * @returns {Promise<string>}
   */
  async loadTemplate(templateName) {
    // Verificar cache
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName);
    }

    // Ler do disco
    const templatePath = path.join(this.templatesDir, `${templateName}.mjml`);

    try {
      const template = await fs.readFile(templatePath, 'utf-8');

      // Cachear em desenvolvimento apenas se NODE_ENV for production
      if (process.env.NODE_ENV === 'production') {
        this.templateCache.set(templateName, template);
      }

      return template;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Template "${templateName}" not found at ${templatePath}`);
      }
      throw error;
    }
  }

  /**
   * Compila variáveis Handlebars no template
   * @param {string} template - Template MJML com variáveis {{}}
   * @param {Object} variables - Objeto com variáveis
   * @returns {string} MJML compilado
   */
  compileHandlebars(template, variables) {
    // Registrar helpers customizados
    this.registerHelpers();

    const compiled = Handlebars.compile(template);
    return compiled(variables);
  }

  /**
   * Registra helpers Handlebars customizados
   */
  registerHelpers() {
    // Helper: formatDate
    if (!Handlebars.helpers.formatDate) {
      Handlebars.registerHelper('formatDate', function(date, format) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleString('pt-BR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      });
    }

    // Helper: currency (formato BRL)
    if (!Handlebars.helpers.currency) {
      Handlebars.registerHelper('currency', function(value) {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      });
    }

    // Helper: number (formato com separadores)
    if (!Handlebars.helpers.number) {
      Handlebars.registerHelper('number', function(value) {
        return new Intl.NumberFormat('pt-BR').format(value);
      });
    }

    // Helper: indent (cria indentação baseada no level)
    if (!Handlebars.helpers.indent) {
      Handlebars.registerHelper('indent', function(level) {
        if (!level || level === 0) return '';
        // Usar &nbsp; (non-breaking space) para indentação em HTML
        const spaces = '&nbsp;&nbsp;&nbsp;&nbsp;'; // 4 espaços
        return new Handlebars.SafeString(spaces.repeat(level));
      });
    }

    // Helper: labelWithEmoji (adiciona emoji se tiver)
    if (!Handlebars.helpers.labelWithEmoji) {
      Handlebars.registerHelper('labelWithEmoji', function(item) {
        const emoji = item.emoji || '';
        const label = item.label || '';
        return emoji ? `${emoji} ${label}` : label;
      });
    }
  }

  /**
   * Gera email de dados de tabela (template padrão)
   * @param {Object} data - Array de objetos com {label, value}
   * @param {Object} metadata - Informações do flow
   * @returns {Promise<string>} HTML do email
   */
  async generateDataTableEmail(data, metadata = {}) {
    const variables = {
      flowName: metadata.flowName || 'Flow',
      executedAt: this.formatDateTime(metadata.executedAt || new Date()),
      blocks: Array.isArray(data) ? this.arrayToBlocks(data) : this.objectToBlocks(data)
    };

    return await this.compileTemplate('email-data-table', variables);
  }

  /**
   * Converte objeto em blocos para exibição
   * Formato: [{title, rows: [{label, value}]}]
   * @param {Object} obj
   * @returns {Array}
   */
  objectToBlocks(obj) {
    const blocks = [];

    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Objeto aninhado - criar bloco com propriedades
        const rows = [];
        Object.entries(value).forEach(([childKey, childValue]) => {
          if (typeof childValue === 'object' && childValue !== null) {
            // Sub-objeto - adicionar inline
            rows.push({
              label: this.formatLabel(childKey),
              value: this.formatObjectInline(childValue)
            });
          } else {
            rows.push({
              label: this.formatLabel(childKey),
              value: this.formatValue(childValue)
            });
          }
        });

        blocks.push({
          title: this.formatLabel(key),
          rows: rows
        });
      } else if (Array.isArray(value)) {
        // Array - criar blocos para cada item
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            const rows = Object.entries(item).map(([k, v]) => ({
              label: this.formatLabel(k),
              value: this.formatValue(v)
            }));

            blocks.push({
              title: `${this.formatLabel(key)} ${index + 1}`,
              rows: rows
            });
          } else {
            // Array de primitivos
            if (index === 0) {
              blocks.push({
                title: this.formatLabel(key),
                rows: value.map((val, i) => ({
                  label: `Item ${i + 1}`,
                  value: this.formatValue(val)
                }))
              });
            }
          }
        });
      } else {
        // Valor primitivo - criar bloco com uma linha
        if (blocks.length === 0 || blocks[blocks.length - 1].title !== 'Dados') {
          blocks.push({
            title: 'Dados',
            rows: []
          });
        }
        blocks[blocks.length - 1].rows.push({
          label: this.formatLabel(key),
          value: this.formatValue(value)
        });
      }
    });

    return blocks;
  }

  /**
   * Converte array em blocos
   * @param {Array} arr
   * @returns {Array}
   */
  arrayToBlocks(arr) {
    return arr.map((item, index) => {
      if (typeof item === 'object' && item !== null) {
        const rows = Object.entries(item).map(([key, value]) => ({
          label: this.formatLabel(key),
          value: this.formatValue(value)
        }));

        return {
          title: `Item ${index + 1}`,
          rows: rows
        };
      } else {
        return {
          title: 'Dados',
          rows: [{
            label: `Item ${index + 1}`,
            value: this.formatValue(item)
          }]
        };
      }
    });
  }

  /**
   * Formata objeto inline (para sub-objetos)
   * @param {Object} obj
   * @returns {string}
   */
  formatObjectInline(obj) {
    return Object.entries(obj)
      .map(([k, v]) => `${this.formatLabel(k)}: ${this.formatValue(v)}`)
      .join(', ');
  }

  /**
   * Formata label (camelCase -> Proper Case)
   * @param {string} key
   * @returns {string}
   */
  formatLabel(key) {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Formata valor para exibição
   * @param {*} value
   * @returns {string}
   */
  formatValue(value) {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    if (typeof value === 'number') return new Intl.NumberFormat('pt-BR').format(value);
    if (typeof value === 'object') {
      // Se chegou aqui, não foi expandido (array vazio ou objeto vazio)
      return JSON.stringify(value);
    }
    return String(value);
  }

  /**
   * Formata data/hora para PT-BR
   * @param {Date|string} date
   * @returns {string}
   */
  formatDateTime(date) {
    const d = new Date(date);
    return d.toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Limpa cache de templates (útil em desenvolvimento)
   */
  clearCache() {
    this.templateCache.clear();
    logger.info('Email template cache cleared');
  }
}

module.exports = new EmailTemplateService();
