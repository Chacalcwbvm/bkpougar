<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require 'conexao.php';

// Parâmetros necessários
$data_checkin = isset($_GET['checkin']) ? $conexao->real_escape_string($_GET['checkin']) : null;
$data_checkout = isset($_GET['checkout']) ? $conexao->real_escape_string($_GET['checkout']) : null;
$hospedes = isset($_GET['hospedes']) ? intval($_GET['hospedes']) : 1;

if (!$data_checkin || !$data_checkout) {
    http_response_code(400);
    echo json_encode(['erro' => 'Datas de check-in e check-out são obrigatórias']);
    exit;
}

// Verifica se as datas são válidas
$checkin = new DateTime($data_checkin);
$checkout = new DateTime($data_checkout);
$hoje = new DateTime();

if ($checkin < $hoje) {
    http_response_code(400);
    echo json_encode(['erro' => 'A data de check-in deve ser futura']);
    exit;
}

if ($checkout <= $checkin) {
    http_response_code(400);
    echo json_encode(['erro' => 'A data de check-out deve ser posterior à data de check-in']);
    exit;
}

// Busca quartos disponíveis que comportem o número de hóspedes
$sql = "SELECT q.* FROM quartos q 
        WHERE q.status = 'disponivel' 
        AND q.capacidade >= $hospedes
        AND q.id NOT IN (
            SELECT r.id_quarto FROM reservas r 
            WHERE r.status != 'cancelada'
            AND (
                (r.data_checkin <= '$data_checkin' AND r.data_checkout >= '$data_checkin')
                OR (r.data_checkin <= '$data_checkout' AND r.data_checkout >= '$data_checkout')
                OR ('$data_checkin' <= r.data_checkin AND '$data_checkout' >= r.data_checkin)
            )
        )
        ORDER BY q.preco ASC";

$resultado = $conexao->query($sql);

$quartos_disponiveis = [];
if ($resultado->num_rows > 0) {
    while($row = $resultado->fetch_assoc()) {
        $quartos_disponiveis[] = $row;
    }
}

echo json_encode([
    'disponivel' => count($quartos_disponiveis) > 0,
    'quartos' => $quartos_disponiveis,
    'checkin' => $data_checkin,
    'checkout' => $data_checkout,
    'hospedes' => $hospedes
]);

$conexao->close();
?>
