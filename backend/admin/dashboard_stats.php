
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../conexao.php';

// Estatísticas gerais para o dashboard
$stats = [];

// Total de quartos
$sql = "SELECT COUNT(*) as total, 
        SUM(CASE WHEN status = 'disponivel' THEN 1 ELSE 0 END) as disponiveis,
        SUM(CASE WHEN status = 'ocupado' THEN 1 ELSE 0 END) as ocupados,
        SUM(CASE WHEN status = 'manutencao' THEN 1 ELSE 0 END) as manutencao
        FROM quartos";
$resultado = $conexao->query($sql);
$stats['quartos'] = $resultado->fetch_assoc();

// Total de reservas
$sql = "SELECT COUNT(*) as total, 
        SUM(CASE WHEN status = 'confirmada' THEN 1 ELSE 0 END) as confirmadas,
        SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pendentes,
        SUM(CASE WHEN status = 'cancelada' THEN 1 ELSE 0 END) as canceladas
        FROM reservas";
$resultado = $conexao->query($sql);
$stats['reservas'] = $resultado->fetch_assoc();

// Receita total
$sql = "SELECT SUM(valor_total) as receita_total FROM reservas WHERE status != 'cancelada'";
$resultado = $conexao->query($sql);
$stats['financeiro'] = $resultado->fetch_assoc();

// Contatos não respondidos
$sql = "SELECT COUNT(*) as nao_respondidos FROM contatos WHERE status = 'novo'";
$resultado = $conexao->query($sql);
$stats['contatos'] = $resultado->fetch_assoc();

// Próximas chegadas (check-ins dos próximos 7 dias)
$hoje = date('Y-m-d');
$proxima_semana = date('Y-m-d', strtotime('+7 days'));

$sql = "SELECT r.*, q.nome as quarto_nome, h.nome as hospede_nome
        FROM reservas r
        JOIN quartos q ON r.id_quarto = q.id
        JOIN hospedes h ON r.id_hospede = h.id
        WHERE r.status = 'confirmada'
        AND r.data_checkin BETWEEN '$hoje' AND '$proxima_semana'
        ORDER BY r.data_checkin ASC
        LIMIT 5";
$resultado = $conexao->query($sql);

$proximos_checkins = [];
if ($resultado->num_rows > 0) {
    while($row = $resultado->fetch_assoc()) {
        $proximos_checkins[] = $row;
    }
}
$stats['proximos_checkins'] = $proximos_checkins;

// Dados para gráfico de ocupação nos próximos 30 dias
$proximo_mes = date('Y-m-d', strtotime('+30 days'));

$sql = "SELECT DATE(data_checkin) as data, COUNT(*) as total
        FROM reservas
        WHERE status != 'cancelada'
        AND data_checkin BETWEEN '$hoje' AND '$proximo_mes'
        GROUP BY DATE(data_checkin)
        ORDER BY data_checkin ASC";
$resultado = $conexao->query($sql);

$ocupacao_diaria = [];
if ($resultado->num_rows > 0) {
    while($row = $resultado->fetch_assoc()) {
        $ocupacao_diaria[$row['data']] = (int)$row['total'];
    }
}
$stats['ocupacao_diaria'] = $ocupacao_diaria;

echo json_encode($stats);

$conexao->close();
?>
