
<?php
require_once '../conexao.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Check if financeiro table exists
    $check = $conexao->query("SHOW TABLES LIKE 'financeiro'");
    if ($check->num_rows == 0) {
        // Create table if it doesn't exist
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
                'mensagem' => 'Erro ao criar tabela de transações',
                'erro' => $conexao->error
            ]);
            exit;
        }
    }
    
    // Get filter parameters
    $data_inicio = isset($_GET['data_inicio']) ? $conexao->real_escape_string($_GET['data_inicio']) : null;
    $data_fim = isset($_GET['data_fim']) ? $conexao->real_escape_string($_GET['data_fim']) : null;
    $tipo = isset($_GET['tipo']) ? $conexao->real_escape_string($_GET['tipo']) : null;
    $id_reserva = isset($_GET['id_reserva']) ? intval($_GET['id_reserva']) : null;
    
    // Build query
    $sql = "SELECT * FROM financeiro";
    $where = [];
    
    if ($data_inicio && $data_fim) {
        $where[] = "data_transacao BETWEEN '$data_inicio' AND '$data_fim 23:59:59'";
    }
    
    if ($tipo) {
        $where[] = "tipo = '$tipo'";
    }
    
    if ($id_reserva) {
        $where[] = "id_reserva = $id_reserva";
    }
    
    if (count($where) > 0) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }
    
    $sql .= " ORDER BY data_transacao DESC";
    
    $resultado = $conexao->query($sql);
    
    if ($resultado) {
        $transacoes = [];
        
        while ($row = $resultado->fetch_assoc()) {
            $transacoes[] = [
                'id' => intval($row['id']),
                'id_reserva' => $row['id_reserva'] ? intval($row['id_reserva']) : null,
                'tipo' => $row['tipo'],
                'valor' => floatval($row['valor']),
                'descricao' => $row['descricao'],
                'data_transacao' => $row['data_transacao'],
                'data_registro' => $row['data_registro'],
                'comprovante' => $row['comprovante'],
                'status' => $row['status']
            ];
        }
        
        echo json_encode([
            'sucesso' => true,
            'transacoes' => $transacoes
        ]);
    } else {
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Erro ao buscar transações',
            'erro' => $conexao->error
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
