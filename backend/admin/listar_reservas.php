
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../conexao.php';

// Pegar o idioma da requisição (padrão: en)
$lang = isset($_GET['lang']) ? $_GET['lang'] : 'en';

// Parâmetros de filtragem opcionais
$filtroStatus = isset($_GET['status']) ? $conexao->real_escape_string($_GET['status']) : '';
$dataInicio = isset($_GET['data_inicio']) ? $conexao->real_escape_string($_GET['data_inicio']) : '';
$dataFim = isset($_GET['data_fim']) ? $conexao->real_escape_string($_GET['data_fim']) : '';
$busca = isset($_GET['busca']) ? $conexao->real_escape_string($_GET['busca']) : '';

// Constrói a query com joins para obter detalhes dos quartos e hospedes
$sql = "SELECT r.*, q.nome as quarto_nome, h.nome as hospede_nome, h.email as hospede_email, h.telefone as hospede_telefone
        FROM reservas r
        LEFT JOIN quartos q ON r.id_quarto = q.id
        LEFT JOIN hospedes h ON r.id_hospede = h.id
        WHERE 1=1";

// Adiciona filtros se fornecidos
if (!empty($filtroStatus)) {
    $sql .= " AND r.status = '$filtroStatus'";
}

if (!empty($dataInicio)) {
    $sql .= " AND r.data_checkin >= '$dataInicio'";
}

if (!empty($dataFim)) {
    $sql .= " AND r.data_checkout <= '$dataFim'";
}

if (!empty($busca)) {
    $sql .= " AND (r.codigo LIKE '%$busca%' OR h.nome LIKE '%$busca%' OR h.email LIKE '%$busca%' OR q.nome LIKE '%$busca%')";
}

// Ordenação
$sql .= " ORDER BY r.data_checkin DESC";

$resultado = $conexao->query($sql);

$reservas = [];
if ($resultado->num_rows > 0) {
    while($row = $resultado->fetch_assoc()) {
        // Verificar se já foi enviada mensagem de WhatsApp para esta reserva
        $id_reserva = $row['id'];
        $check_whatsapp = $conexao->query("SELECT id FROM mensagens_enviadas WHERE id_reserva = $id_reserva AND tipo = 'whatsapp' LIMIT 1");
        $row['whatsapp_enviado'] = $check_whatsapp->num_rows > 0;
        
        $reservas[] = $row;
    }
}

echo json_encode($reservas);

$conexao->close();
?>
