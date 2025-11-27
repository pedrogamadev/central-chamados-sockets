import './App.css'

const chamados = [
  {
    id: 'CH-001',
    titulo: 'Erro ao abrir chamado',
    status: 'Aberto',
    prioridade: 'Alta',
  },
  {
    id: 'CH-002',
    titulo: 'Atualizar dados do cliente',
    status: 'Em andamento',
    prioridade: 'Média',
  },
  {
    id: 'CH-003',
    titulo: 'Solicitar novo acesso',
    status: 'Concluído',
    prioridade: 'Baixa',
  },
]

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Central de Chamados – Web Client</h1>
        <p>
          Esta interface web será usada para abrir, acompanhar e gerenciar os chamados
          do sistema.
        </p>
      </header>

      <section className="card">
        <div className="card-header">
          <div>
            <p className="label">Chamados</p>
            <h2>Visão geral</h2>
          </div>
          <button type="button" className="primary-button">
            Abrir novo chamado
          </button>
        </div>

        <ul className="tickets">
          {chamados.map((chamado) => (
            <li key={chamado.id} className="ticket-item">
              <div className="ticket-row">
                <span className="ticket-id">{chamado.id}</span>
                <span className="badge status">{chamado.status}</span>
                <span className="badge priority">{chamado.prioridade}</span>
              </div>
              <p className="ticket-title">{chamado.titulo}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default App
