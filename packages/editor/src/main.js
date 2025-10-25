import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { bootstrap as initEngine } from './engine'

/**
 * Inicializa a aplicação FlowForge
 * 1. Carrega o engine (nodes.json + registry)
 * 2. Configura Vue + Pinia + Router
 * 3. Monta a aplicação
 */
async function bootstrap() {
  try {
    // 1. Inicializar Engine
    const engineResult = await initEngine()

    if (!engineResult.success) {
      throw new Error(`Engine falhou: ${engineResult.error}`)
    }

    // 2. Criar aplicação Vue
    const app = createApp(App)

    // 3. Configurar plugins
    app.use(createPinia())
    app.use(router)

    // 4. Montar aplicação
    app.mount('#app')
  } catch (error) {

    // Exibir erro amigável para o usuário
    document.body.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: system-ui, -apple-system, sans-serif;
        background: #0f172a;
        color: #f1f5f9;
        padding: 2rem;
      ">
        <div style="max-width: 600px; text-align: center;">
          <h1 style="font-size: 2rem; margin-bottom: 1rem; color: #ef4444;">
            ⚠️ Falha ao Inicializar
          </h1>
          <p style="font-size: 1rem; margin-bottom: 2rem; color: #94a3b8;">
            Não foi possível carregar o FlowForge Engine.
          </p>
          <details style="
            text-align: left;
            background: #1e293b;
            padding: 1rem;
            border-radius: 0.5rem;
            border: 1px solid #334155;
          ">
            <summary style="cursor: pointer; font-weight: 600; color: #f59e0b;">
              Detalhes do erro
            </summary>
            <pre style="
              margin-top: 1rem;
              font-size: 0.875rem;
              color: #e2e8f0;
              white-space: pre-wrap;
            ">${error.message}\n\n${error.stack || ''}</pre>
          </details>
          <button
            onclick="location.reload()"
            style="
              margin-top: 2rem;
              padding: 0.75rem 1.5rem;
              background: #3b82f6;
              color: white;
              border: none;
              border-radius: 0.5rem;
              font-size: 1rem;
              cursor: pointer;
              font-weight: 600;
            "
          >
            🔄 Tentar Novamente
          </button>
        </div>
      </div>
    `
  }
}

// Iniciar aplicação
bootstrap()
