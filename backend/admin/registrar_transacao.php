<?php
require_once '../conexao.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dados = json_decode(file_get_contents('php://input'), true);
    
    if (!$dados || !isset($dados['tipo']) || !isset($dados['valor'])) {
        echo json_encode([
            'sucesso' => false,
            'erro' => 'Dados incompletos para registrar transação'
        ]);
        exit;
    }
    
    // Validar e preparar dados
    $tipo = $conexao->real_escape_string($dados['tipo']);
    $valor = floatval($dados['valor']);
    $descricao = $conexao->real_escape_string($dados['descricao'] ?? '');
    $id_reserva = isset($dados['id_reserva']) ? intval($dados['id_reserva']) : null;
    
    // Verificar se a tabela existe
    $check = $conexao->query("SHOW TABLES LIKE 'financeiro'");
    if ($check->num_rows == 0) {
        // Criar tabela se não existir
        $sql = "CREATE TABLE financeiro (
            id INT AUTO_INCREMENT PRIMARY KEY,
            id_reserva INT,
            tipo VARCHAR(50) NOT NULL,
            valor DECIMAL(10,2) NOT NULL,
            descricao TEXT,
            data_transacao DATETIME NOT NULL,
            data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            comprovante VARCHAR(255),
            status VARCHAR(20) DEFAULT 'concluido'
        )";
        
        if (!$conexao->query($sql)) {
            echo json_encode([
                'sucesso' => false,
                'erro' => 'Erro ao criar tabela de transações',
                'detalhe' => $conexao->error
            ]);
            exit;
        }
    }
    
    // Inserir a transação
    $sql = "INSERT INTO financeiro (id_reserva, tipo, valor, descricao, data_transacao) VALUES (";
    $sql .= $id_reserva ? "$id_reserva" : "NULL";
    $sql .= ", '$tipo', $valor, '$descricao', NOW())";
    
    if ($conexao->query($sql)) {
        $id_transacao = $conexao->insert_id;
        
        // Se estiver relacionada a uma reserva, atualizar o status financeiro da reserva
        if ($id_reserva) {
            // Calcular o saldo da reserva (pagamentos - reembolsos)
            $sql_saldo = "SELECT 
                SUM(CASE WHEN tipo = 'payment' OR tipo = 'deposit' THEN valor ELSE 0 END) as entradas,
                SUM(CASE WHEN tipo = 'refund' OR tipo = 'expense' THEN valor ELSE 0 END) as saidas
                FROM financeiro 
                WHERE id_reserva = $id_reserva";
                
            $resultado = $conexao->query($sql_saldo);
            if ($resultado && $row = $resultado->fetch_assoc()) {
                $saldo = floatval($row['entradas']) - floatval($row['saidas']);
                
                // Atualizar o status financeiro da reserva
                $status_financeiro = 'pendente';
                if ($saldo > 0) {
                    $status_financeiro = 'parcial';
                    
                    // Obter o valor total da reserva
                    $sql_reserva = "SELECT valor_total FROM reservas WHERE id = $id_reserva";
                    $res_reserva = $conexao->query($sql_reserva);
                    if ($res_reserva && $reserva = $res_reserva->fetch_assoc()) {
                        $valor_total = floatval($reserva['valor_total']);
                        
                        if ($saldo >= $valor_total) {
                            $status_financeiro = 'pago';
                        }
                    }
                }
                
                // Atualizar a reserva
                $sql_update = "UPDATE reservas SET 
                               status_pagamento = '$status_financeiro',
                               valor_pago = $saldo
                               WHERE id = $id_reserva";
                $conexao->query($sql_update);
            }
        }
        
        echo json_encode([
            'sucesso' => true,
            'id_transacao' => $id_transacao,
            'mensagem' => 'Transação registrada com sucesso'
        ]);
    } else {
        echo json_encode([
            'sucesso' => false,
            'erro' => 'Erro ao registrar transação',
            'detalhe' => $conexao->error
        ]);
    }
} else {
    echo json_encode([
        'sucesso' => false,
        'mensagem' => 'Método não permitido'
    ]);
}

$conexao->close();
?>
