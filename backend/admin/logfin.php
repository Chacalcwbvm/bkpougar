<?php
// C:\xampps\htdocs\pougar\backend\admin\logfin.php

include '../conexao.php';

$id_reserva     = isset($_POST['id_reserva']) ? intval($_POST['id_reserva']) : null;
$tipo           = isset($_POST['tipo']) ? strtoupper(trim($_POST['tipo'])) : '';
$valor          = isset($_POST['valor']) ? floatval($_POST['valor']) : 0;
$data_transacao = isset($_POST['data_transacao']) ? $_POST['data_transacao'] : date('Y-m-d H:i:s');
$detalhes       = isset($_POST['detalhes']) ? trim($_POST['detalhes']) : '';

// Verifica se tipo e valor são válidos
if ($tipo === '' || $valor <= 0) {
    http_response_code(400);
    echo json_encode(["erro" => "Dados obrigatórios ausentes ou inválidos."]);
    exit;
}

// Verifica se id_reserva existe, se fornecido
if ($id_reserva !== null) {
    $check = $conn->prepare("SELECT id FROM reservas WHERE id = ?");
    $check->bind_param("i", $id_reserva);
    $check->execute();
    $result = $check->get_result();
    if ($result->num_rows === 0) {
        http_response_code(400);
        echo json_encode(["erro" => "ID de reserva não existe."]);
        exit;
    }
    $check->close();
}

$stmt = $conn->prepare("INSERT INTO logs_financeiro (id_reserva, tipo, valor, data_transacao, detalhes) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("isdss", $id_reserva, $tipo, $valor, $data_transacao, $detalhes);

if ($stmt->execute()) {
    echo json_encode(["sucesso" => true, "id_log" => $stmt->insert_id]);
} else {
    http_response_code(500);
    echo json_encode(["erro" => "Erro ao inserir no log financeiro."]);
}

$stmt->close();
$conn->close();
?>
