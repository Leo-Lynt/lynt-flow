<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 md:p-12">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Termos de Serviço</h1>
        <p class="text-gray-600">Última atualização: {{ lastUpdated }}</p>
      </div>

      <!-- Introduction -->
      <section class="mb-8">
        <p class="text-gray-700 leading-relaxed">
          Estes Termos de Serviço ("Termos") regem o uso da plataforma LyntFlow ("Serviço") operada pela
          Lynt ("nós", "nosso" ou "empresa").
        </p>
        <p class="text-gray-700 leading-relaxed mt-4">
          Ao acessar ou usar o Serviço, você concorda em estar vinculado a estes Termos. Se você não concordar
          com qualquer parte dos Termos, não poderá acessar o Serviço.
        </p>
      </section>

      <!-- Account Registration -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">1. Registro de Conta</h2>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">1.1 Elegibilidade</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          Você deve ter pelo menos 18 anos de idade para usar este Serviço. Ao criar uma conta, você declara
          e garante que tem pelo menos 18 anos de idade.
        </p>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">1.2 Informações da Conta</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          Ao criar uma conta, você concorda em:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4">
          <li>Fornecer informações precisas, atuais e completas</li>
          <li>Manter a segurança de sua senha</li>
          <li>Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta</li>
          <li>Ser responsável por todas as atividades que ocorram em sua conta</li>
        </ul>
      </section>

      <!-- Service Description -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">2. Descrição do Serviço</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          O LyntFlow é uma plataforma de automação de workflows que permite:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4">
          <li>Criar e gerenciar fluxos de automação</li>
          <li>Conectar-se a serviços de terceiros (Google Analytics, Google Sheets, etc.)</li>
          <li>Agendar execuções de workflows</li>
          <li>Visualizar histórico e logs de execuções</li>
          <li>Compartilhar fluxos com outros usuários</li>
        </ul>
      </section>

      <!-- Acceptable Use -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">3. Uso Aceitável</h2>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">3.1 Você Concorda em NÃO:</h3>
        <ul class="list-disc list-inside text-gray-700 ml-4 mb-4">
          <li>Usar o Serviço para fins ilegais ou não autorizados</li>
          <li>Violar quaisquer leis em sua jurisdição</li>
          <li>Infringir ou violar direitos de propriedade intelectual</li>
          <li>Transmitir vírus, malware ou código malicioso</li>
          <li>Coletar ou rastrear informações pessoais de outros usuários</li>
          <li>Interferir ou interromper o Serviço ou servidores</li>
          <li>Realizar engenharia reversa ou tentar extrair o código-fonte</li>
          <li>Usar o Serviço para spam ou comunicações não solicitadas</li>
          <li>Revender ou redistribuir o Serviço sem autorização</li>
          <li>Criar automações que:
            <ul class="list-disc list-inside text-gray-700 ml-8">
              <li>Façam requisições excessivas ou abusivas às APIs de terceiros (incluindo Google)</li>
              <li>Tentem burlar limites de taxa (rate limits) de APIs</li>
              <li>Violem os termos de serviço dos provedores de API (Google, etc.)</li>
              <li>Causem sobrecarga intencional em sistemas de terceiros</li>
            </ul>
          </li>
        </ul>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">3.2 Integrações de Terceiros</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          Ao conectar serviços de terceiros (como Google Analytics ou Google Sheets):
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4 mb-4">
          <li>Você garante que tem autorização para acessar esses dados</li>
          <li>Você concorda em cumprir os termos de serviço desses provedores</li>
          <li>Você é responsável por gerenciar e revogar acessos quando necessário</li>
        </ul>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">3.3 Quotas e Limites de API</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          As APIs de terceiros (especialmente Google Analytics e Google Sheets) possuem quotas e limites de uso diários.
          <strong>Importante:</strong>
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4 mb-4">
          <li>Você é responsável por gerenciar as quotas de API da sua própria conta Google</li>
          <li>O LyntFlow não se responsabiliza por erros causados quando você excede quotas do Google</li>
          <li>Recomendamos configurar intervalos adequados entre execuções de workflows para evitar exceder limites</li>
          <li>Erros como "Quota exceeded" ou "Rate limit exceeded" são controlados pelo Google, não pelo LyntFlow</li>
          <li>Você pode verificar suas quotas no <a href="https://console.cloud.google.com/apis/dashboard" target="_blank" class="text-blue-600 hover:underline">Google Cloud Console</a></li>
        </ul>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">3.4 Limites de Uso do LyntFlow</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          Podemos impor limites razoáveis de uso para garantir a qualidade do serviço para todos os usuários:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4">
          <li>Número de workflows ativos por conta (varia por plano)</li>
          <li>Número de execuções simultâneas</li>
          <li>Tempo máximo de execução por workflow</li>
          <li>Tamanho de dados processados por execução</li>
        </ul>
        <p class="text-gray-700 leading-relaxed mt-4">
          Reservamo-nos o direito de ajustar esses limites conforme necessário, com aviso prévio quando aplicável.
        </p>
      </section>

      <!-- Intellectual Property -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">4. Propriedade Intelectual</h2>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">4.1 Propriedade do Serviço</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          O Serviço e todo o conteúdo, recursos e funcionalidades são de propriedade da Lynt e são protegidos
          por direitos autorais, marcas registradas e outras leis de propriedade intelectual.
        </p>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">4.2 Seus Dados e Workflows</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          Você mantém todos os direitos sobre os dados e workflows que você cria no LyntFlow. Ao usar o Serviço,
          você nos concede uma licença limitada para:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4">
          <li>Armazenar e processar seus dados para fornecer o Serviço</li>
          <li>Fazer backups de seus workflows e dados</li>
          <li>Usar dados agregados e anonimizados para melhorar o Serviço</li>
        </ul>
      </section>

      <!-- Service Availability -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">5. Disponibilidade do Serviço</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          Nos esforçamos para manter o Serviço disponível 24/7, mas:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4">
          <li>Não garantimos que o Serviço estará sempre disponível, ininterrupto ou livre de erros</li>
          <li>Podemos realizar manutenção programada com aviso prévio quando possível</li>
          <li>Podemos modificar ou descontinuar recursos do Serviço a qualquer momento</li>
          <li>Não somos responsáveis por interrupções causadas por terceiros ou circunstâncias fora de nosso controle</li>
        </ul>
      </section>

      <!-- Fees and Payment -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">6. Taxas e Pagamento</h2>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">6.1 Planos Gratuitos e Pagos</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          O LyntFlow pode oferecer planos gratuitos e pagos. Os detalhes de cada plano serão claramente
          apresentados antes da assinatura.
        </p>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">6.2 Alterações de Preço</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          Reservamo-nos o direito de alterar nossas taxas a qualquer momento. Notificaremos você com
          antecedência razoável sobre qualquer alteração de preço.
        </p>
      </section>

      <!-- Termination -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">7. Encerramento</h2>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">7.1 Por Você</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          Você pode encerrar sua conta a qualquer momento através das configurações de perfil ou
          entrando em contato conosco.
        </p>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">7.2 Por Nós</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          Podemos suspender ou encerrar sua conta imediatamente, sem aviso prévio, se você:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4 mb-4">
          <li>Violar estes Termos de Serviço</li>
          <li>Usar o Serviço de forma fraudulenta ou ilegal</li>
          <li>Deixar de pagar taxas devidas</li>
          <li>Representar um risco de segurança</li>
        </ul>

        <h3 class="text-xl font-semibold text-gray-800 mb-3">7.3 Efeitos do Encerramento</h3>
        <p class="text-gray-700 leading-relaxed mb-4">
          Após o encerramento da conta:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4">
          <li>Seu acesso ao Serviço será revogado imediatamente</li>
          <li>Seus dados poderão ser excluídos após um período de retenção de 30 dias</li>
          <li>Você pode solicitar uma exportação de seus dados antes da exclusão</li>
        </ul>
      </section>

      <!-- Disclaimer -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">8. Isenções de Responsabilidade</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          O SERVIÇO É FORNECIDO "NO ESTADO EM QUE SE ENCONTRA" E "CONFORME DISPONÍVEL", SEM GARANTIAS
          DE QUALQUER TIPO, EXPRESSAS OU IMPLÍCITAS.
        </p>
        <p class="text-gray-700 leading-relaxed mb-4">
          Especificamente, não garantimos que:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4">
          <li>O Serviço atenderá suas necessidades específicas</li>
          <li>O Serviço será ininterrupto, oportuno, seguro ou livre de erros</li>
          <li>Os resultados obtidos do uso do Serviço serão precisos ou confiáveis</li>
          <li>Quaisquer erros no Serviço serão corrigidos</li>
        </ul>
      </section>

      <!-- Limitation of Liability -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">9. Limitação de Responsabilidade</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          EM NENHUM CASO A LYNT, SEUS DIRETORES, FUNCIONÁRIOS OU PARCEIROS SERÃO RESPONSÁVEIS POR:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4">
          <li>Danos indiretos, incidentais, especiais, consequenciais ou punitivos</li>
          <li>Perda de lucros, receita, dados ou uso</li>
          <li>Interrupção de negócios</li>
          <li>Custo de obtenção de produtos ou serviços substitutos</li>
        </ul>
        <p class="text-gray-700 leading-relaxed mt-4">
          Nossa responsabilidade total não excederá o valor que você pagou pelo Serviço nos últimos 12 meses.
        </p>
      </section>

      <!-- Indemnification -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">10. Indenização</h2>
        <p class="text-gray-700 leading-relaxed">
          Você concorda em indenizar e isentar a Lynt de qualquer reivindicação, dano, obrigação, perda,
          responsabilidade, custo ou dívida decorrentes de:
        </p>
        <ul class="list-disc list-inside text-gray-700 ml-4">
          <li>Seu uso e acesso ao Serviço</li>
          <li>Sua violação destes Termos</li>
          <li>Sua violação de direitos de terceiros</li>
          <li>Conteúdo que você enviar ou transmitir através do Serviço</li>
        </ul>
      </section>

      <!-- Governing Law -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">11. Lei Aplicável</h2>
        <p class="text-gray-700 leading-relaxed">
          Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar
          suas disposições sobre conflito de leis. Qualquer disputa será resolvida nos tribunais
          competentes do Brasil.
        </p>
      </section>

      <!-- Changes to Terms -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">12. Alterações nos Termos</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. Se uma
          revisão for material, forneceremos aviso de pelo menos 30 dias antes de os novos termos entrarem em vigor.
        </p>
        <p class="text-gray-700 leading-relaxed">
          O uso continuado do Serviço após alterações constituirá sua aceitação dos novos Termos.
        </p>
      </section>

      <!-- Severability -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">13. Divisibilidade</h2>
        <p class="text-gray-700 leading-relaxed">
          Se qualquer disposição destes Termos for considerada inválida ou inexequível, as demais disposições
          permanecerão em pleno vigor e efeito.
        </p>
      </section>

      <!-- Entire Agreement -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">14. Acordo Completo</h2>
        <p class="text-gray-700 leading-relaxed">
          Estes Termos constituem o acordo completo entre você e a Lynt em relação ao Serviço e substituem
          todos os acordos anteriores e contemporâneos.
        </p>
      </section>

      <!-- Contact -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">15. Contato</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco:
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
        <p class="text-center text-gray-500 text-sm mt-2">
          Ao usar o LyntFlow, você concorda com estes Termos de Serviço e nossa
          <RouterLink to="/privacy-policy" class="text-blue-600 hover:underline">Política de Privacidade</RouterLink>.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

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
