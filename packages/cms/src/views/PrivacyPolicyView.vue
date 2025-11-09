<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 md:p-12">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
        <p class="text-gray-600">Última atualização: {{ lastUpdated }}</p>
      </div>

      <!-- Introduction -->
      <section class="mb-8">
        <p class="text-gray-700 leading-relaxed">
          A Lynt ("nós", "nosso" ou "empresa") opera a plataforma LyntFlow (o "Serviço").
          Esta página informa sobre nossas políticas relativas à coleta, uso e divulgação de dados pessoais
          quando você usa nosso Serviço e as escolhas que você tem associadas a esses dados.
        </p>
        <p class="text-gray-700 leading-relaxed mt-4">
          Usamos seus dados para fornecer e melhorar o Serviço. Ao usar o Serviço, você concorda com a
          coleta e uso de informações de acordo com esta política.
        </p>
      </section>

      <!-- Information Collection -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">1. Informações que Coletamos</h2>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">1.1 Informações de Cadastro</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          Ao criar uma conta no LyntFlow, coletamos:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4 mb-4">
          <li>Nome completo</li>
          <li>Endereço de e-mail</li>
          <li>Senha (armazenada de forma criptografada)</li>
        </ul>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">1.2 Informações do Google OAuth</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          Quando você se conecta usando o Google ("Login com Google" ou conecta serviços do Google), coletamos:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4 mb-4">
          <li><strong>Perfil básico:</strong> Nome, endereço de e-mail e foto de perfil</li>
          <li><strong>Google Analytics:</strong> Acesso a dados de propriedades do Google Analytics que você autoriza, incluindo métricas (sessões, visualizações de página, taxa de rejeição, conversões) e dimensões (fonte de tráfego, dispositivo, localização geográfica, páginas visitadas)</li>
          <li><strong>Google Sheets:</strong> Acesso a planilhas do Google que você autoriza, incluindo leitura e escrita de células, criação de novas linhas, e formatação de dados para automações</li>
        </ul>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">1.3 Acesso Offline</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          Solicitamos acesso offline (refresh tokens) às suas contas do Google para que suas automações possam
          executar mesmo quando você não estiver logado ativamente no LyntFlow. Isso permite que workflows
          agendados funcionem sem precisar de re-autenticação constante. Você pode revogar esse acesso a qualquer momento.
        </p>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">1.4 Informações de Uso</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          Coletamos informações sobre como você usa o Serviço:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4 mb-4">
          <li>Endereço IP</li>
          <li>Tipo de navegador</li>
          <li>Sistema operacional</li>
          <li>Páginas visitadas</li>
          <li>Horário e data de acesso</li>
          <li>Tempo gasto nas páginas</li>
        </ul>
      </section>

      <!-- How We Use Information -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">2. Como Usamos Suas Informações</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          Usamos os dados coletados para diversos fins:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4">
          <li>Fornecer e manter nosso Serviço</li>
          <li>Notificá-lo sobre mudanças em nosso Serviço</li>
          <li>Permitir que você participe de recursos interativos quando escolher fazê-lo</li>
          <li>Fornecer suporte ao cliente</li>
          <li>Coletar análises ou informações valiosas para melhorar o Serviço</li>
          <li>Monitorar o uso do Serviço</li>
          <li>Detectar, prevenir e resolver problemas técnicos</li>
          <li>Executar automações de workflows que você configurar (usando dados do Google Analytics e Google Sheets)</li>
        </ul>
      </section>

      <!-- Data Storage and Security -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">3. Armazenamento e Segurança de Dados</h2>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">3.1 Segurança</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          A segurança dos seus dados é importante para nós. Implementamos medidas de segurança:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4 mb-4">
          <li>Criptografia de senhas usando algoritmos bcrypt</li>
          <li>Tokens OAuth criptografados com AES-256-CBC</li>
          <li>Conexões HTTPS/TLS</li>
          <li>Autenticação de dois fatores (2FA) disponível</li>
          <li>Monitoramento de sessões ativas</li>
        </ul>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">3.2 Retenção de Dados</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          Retemos seus dados pessoais apenas pelo tempo necessário para os fins estabelecidos nesta Política de Privacidade:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4 mb-4">
          <li><strong>Tokens OAuth:</strong> São deletados imediatamente quando você revoga o acesso ou desconecta uma integração</li>
          <li><strong>Dados em cache:</strong> Dados do Google Analytics e Sheets em cache são deletados em até 48 horas após revogação</li>
          <li><strong>Logs de execução:</strong> Mantidos por até 90 dias para fins de debug e suporte</li>
          <li><strong>Dados da conta:</strong> Mantidos até você solicitar exclusão da conta, após o que são deletados permanentemente em até 30 dias</li>
        </ul>
        <p class="text-gray-700 leading-relaxed mb-4">
          Você pode solicitar a exclusão de sua conta e dados a qualquer momento através do e-mail leonardo@lynt.io.
        </p>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">3.3 Incidentes de Segurança</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          Em caso de violação de dados que afete tokens OAuth ou dados obtidos do Google:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4 mb-4">
          <li>Notificaremos usuários afetados em até 72 horas</li>
          <li>Revogaremos tokens comprometidos imediatamente</li>
          <li>Reportaremos ao Google conforme suas políticas</li>
          <li>Tomaremos medidas corretivas para prevenir futuros incidentes</li>
        </ul>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">3.4 Logs e Monitoramento</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          Mantemos logs de execuções de workflows e chamadas de API para fins de:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4 mb-4">
          <li>Debug e resolução de problemas técnicos</li>
          <li>Monitoramento de performance e disponibilidade</li>
          <li>Detecção de uso anômalo ou fraudulento</li>
        </ul>
        <p class="text-gray-700 leading-relaxed mb-4">
          Logs são anonimizados quando possível e retidos por no máximo 90 dias. Dados sensíveis do Google não são incluídos em logs.
        </p>
      </section>

      <!-- Google API Services -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">4. Uso de Serviços da API do Google</h2>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">4.1 Política de Uso Limitado</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          <strong>O uso que o LyntFlow faz de informações recebidas das APIs do Google aderirá à
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" class="text-blue-600 hover:underline">
            Política de Dados do Usuário dos Serviços da API do Google
          </a>, incluindo os requisitos de Uso Limitado (Limited Use requirements).</strong>
        </p>
        <p class="text-gray-700 leading-relaxed mb-4">
          Isso significa que o LyntFlow:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4 mb-4">
          <li>Usa dados do Google APENAS para fornecer e melhorar as funcionalidades de automação que você solicitou</li>
          <li>NÃO compartilha dados obtidos via API do Google com terceiros</li>
          <li>NÃO usa dados do Google para servir anúncios ou publicidade</li>
          <li>NÃO vende dados de usuários do Google</li>
          <li>NÃO permite que humanos leiam seus dados, exceto quando:</li>
          <ul class="list-disc list-inside text-gray-700 ml-8">
            <li>Você nos dá consentimento explícito para acesso específico</li>
            <li>É necessário para segurança (ex: investigar abuso)</li>
            <li>É necessário para cumprir a lei</li>
            <li>É feito de forma agregada e anonimizada para fins internos</li>
          </ul>
        </ul>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">4.2 Como Revogar Acesso</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          Você pode revogar o acesso do LyntFlow aos seus dados do Google a qualquer momento através de:
        </p>

        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p class="text-gray-700 mb-2"><strong>Método 1: Configurações do Google</strong></p>
          <ol class="list-decimal list-inside text-gray-700 ml-4">
            <li>Acesse <a href="https://myaccount.google.com/permissions" target="_blank" class="text-blue-600 hover:underline font-semibold">Google Account Permissions</a></li>
            <li>Encontre "LyntFlow" na lista de aplicativos conectados</li>
            <li>Clique em "Remover acesso"</li>
          </ol>
        </div>

        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p class="text-gray-700 mb-2"><strong>Método 2: Dentro do LyntFlow</strong></p>
          <ol class="list-decimal list-inside text-gray-700 ml-4">
            <li>Acesse suas configurações de perfil</li>
            <li>Vá para "Conexões" ou "Integrações"</li>
            <li>Clique em "Desconectar" na integração do Google desejada</li>
          </ol>
        </div>

        <p class="text-gray-700 leading-relaxed mb-4">
          <strong>O que acontece após revogar:</strong>
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4 mb-4">
          <li>Seus tokens OAuth são deletados imediatamente do nosso sistema</li>
          <li>Workflows que usam essa integração param de funcionar</li>
          <li>Dados em cache são deletados em até 48 horas</li>
          <li>Você pode reconectar a qualquer momento</li>
        </ul>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">4.3 Transferência e Uso de Dados</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          A transferência de informações do LyntFlow para qualquer outro aplicativo de dados recebidos das APIs do Google
          aderirá à Política de Dados do Usuário dos Serviços da API do Google, incluindo os requisitos de Uso Limitado.
        </p>
      </section>

      <!-- Data Sharing -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">5. Compartilhamento de Dados</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          <strong>Nós NÃO vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros para fins de marketing.</strong>
        </p>
        <p class="text-gray-700 leading-relaxed mb-4">
          Podemos compartilhar informações apenas nas seguintes circunstâncias:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4 mb-4">
          <li><strong>Provedores de serviço:</strong> Compartilhamos com empresas que nos ajudam a operar nosso serviço (hospedagem, banco de dados)</li>
          <li><strong>Requisitos legais:</strong> Se exigido por lei ou para proteger nossos direitos</li>
          <li><strong>Com seu consentimento:</strong> Quando você autoriza explicitamente</li>
        </ul>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">5.1 Workflows Públicos e Compartilhamento</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          O LyntFlow permite que você publique workflows na biblioteca pública para compartilhar com outros usuários.
          <strong>É importante entender o que é e o que NÃO é compartilhado:</strong>
        </p>

        <div class="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p class="text-gray-700 mb-2"><strong>✓ O que É compartilhado quando você publica um workflow:</strong></p>
          <ul class="list-disc list-inside text-gray-700 ml-4">
            <li>A lógica e estrutura do workflow (nós, conexões, configurações)</li>
            <li>Nome, descrição e tags do workflow</li>
            <li>Seu nome de usuário (como autor)</li>
            <li>Estatísticas públicas (número de usos, favoritos)</li>
          </ul>
        </div>

        <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p class="text-gray-700 mb-2"><strong>✗ O que NÃO É compartilhado:</strong></p>
          <ul class="list-disc list-inside text-gray-700 ml-4">
            <li>Suas credenciais ou tokens OAuth (Google, APIs, etc.)</li>
            <li>Dados específicos de suas integrações (Google Analytics IDs, Sheets URLs, etc.)</li>
            <li>Histórico de execuções e logs</li>
            <li>Dados armazenados em variáveis ou cache</li>
            <li>Informações da sua conta (email, configurações)</li>
          </ul>
        </div>

        <p class="text-gray-700 leading-relaxed mb-4">
          Quando outro usuário copia um workflow público da biblioteca:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4">
          <li>Ele recebe apenas a estrutura/template do workflow</li>
          <li>Ele precisa conectar suas PRÓPRIAS contas do Google e outras integrações</li>
          <li>Nenhum dado ou credencial sua é transferido</li>
          <li>Os workflows são executados de forma completamente isolada</li>
        </ul>
      </section>

      <!-- Your Rights (LGPD) -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">6. Seus Direitos (LGPD)</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4">
          <li><strong>Acesso:</strong> Solicitar acesso aos seus dados pessoais</li>
          <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
          <li><strong>Exclusão:</strong> Solicitar a exclusão de seus dados</li>
          <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
          <li><strong>Revogação:</strong> Revogar consentimento para tratamento de dados</li>
          <li><strong>Oposição:</strong> Opor-se ao tratamento de dados em certas circunstâncias</li>
        </ul>
        <p class="text-gray-700 leading-relaxed mt-4">
          Para exercer qualquer um desses direitos, entre em contato conosco através do e-mail:
          <a href="mailto:leonardo@lynt.io" class="text-blue-600 hover:underline">leonardo@lynt.io</a>
        </p>
      </section>

      <!-- Cookies -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">7. Cookies e Tecnologias Similares</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          Usamos cookies e tecnologias similares para rastrear a atividade em nosso Serviço e manter certas informações.
        </p>
        <p class="text-gray-700 leading-relaxed mb-4">
          Tipos de cookies que usamos:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4">
          <li><strong>Cookies de sessão:</strong> Para manter você autenticado</li>
          <li><strong>Cookies de preferência:</strong> Para lembrar suas configurações</li>
          <li><strong>Cookies de segurança:</strong> Para fins de segurança</li>
        </ul>
      </section>

      <!-- Third Party Services -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">8. Serviços de Terceiros</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          Nosso Serviço pode conter links para outros sites. Se você clicar em um link de terceiros,
          será direcionado para esse site. Recomendamos fortemente que você revise a Política de Privacidade
          de cada site que visitar.
        </p>
        <p class="text-gray-700 leading-relaxed">
          Integrações de terceiros que usamos:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4">
          <li>Google OAuth (autenticação)</li>
          <li>Google Analytics API (integração de dados)</li>
          <li>Google Sheets API (integração de planilhas)</li>
        </ul>
      </section>

      <!-- Children's Privacy -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">9. Privacidade de Crianças</h2>
        <p class="text-gray-700 leading-relaxed">
          Nosso Serviço não é direcionado a menores de 18 anos. Não coletamos intencionalmente informações
          pessoalmente identificáveis de menores de 18 anos. Se você é pai ou responsável e está ciente de que
          seu filho nos forneceu dados pessoais, entre em contato conosco.
        </p>
      </section>

      <!-- Changes to Policy -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">10. Alterações nesta Política de Privacidade</h2>
        <p class="text-gray-700 leading-relaxed">
          Podemos atualizar nossa Política de Privacidade periodicamente. Notificaremos você sobre quaisquer
          alterações publicando a nova Política de Privacidade nesta página e atualizando a data de "última atualização".
        </p>
        <p class="text-gray-700 leading-relaxed mt-4">
          Recomendamos que você revise esta Política de Privacidade periodicamente para quaisquer alterações.
        </p>
      </section>

      <!-- Contact -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">11. Contato</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco:
        </p>
        <ul class="list-none text-gray-700 ml-4">
          <li class="mb-2">
            <strong>E-mail:</strong>
            <a href="mailto:leonardo@lynt.io" class="text-blue-600 hover:underline ml-2">leonardo@lynt.io</a>
          </li>
        </ul>
      </section>

      <!-- Footer -->
      <div class="mt-12 pt-8 border-t border-gray-200">
        <p class="text-center text-gray-600">
          © {{ currentYear }} Lynt. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const lastUpdated = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
h2 {
  scroll-margin-top: 2rem;
}

h3 {
  scroll-margin-top: 2rem;
}

a {
  transition: all 0.2s ease;
}
</style>
