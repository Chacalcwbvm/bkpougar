<?php
// Conexão com o banco de dados
$mysqli = new mysqli("localhost", "root", "", "pousada_viva");

// Verifica a conexão
if ($mysqli->connect_error) {
    die("Erro de conexão: " . $mysqli->connect_error);
}

// Buscar todas as reservas
$query_reservas = "SELECT * FROM reservas";
$result_reservas = $mysqli->query($query_reservas);

// Verifica se há reservas
if ($result_reservas->num_rows > 0) {
    while ($row_reserva = $result_reservas->fetch_assoc()) {
        $id_reserva = $row_reserva['id'];
        $valor_total = $row_reserva['valor_total'];
        $data_checkin = $row_reserva['data_checkin'];
        $descricao = "Pagamento pela reserva #" . $row_reserva['codigo'];

        // Preenche a tabela financeiro
        $query_financeiro = "INSERT INTO financeiro (id_reserva, tipo, valor, descricao, data_transacao, status)
                             VALUES ('$id_reserva', 'Pagamento', '$valor_total', '$descricao', '$data_checkin', 'concluido')";
        
        if ($mysqli->query($query_financeiro) === TRUE) {
            echo "Registro inserido com sucesso para a reserva #" . $row_reserva['codigo'] . "<br>";
        } else {
            echo "Erro ao inserir registro para a reserva #" . $row_reserva['codigo'] . ": " . $mysqli->error . "<br>";
        }
    }
} else {
    echo "Nenhuma reserva encontrada.";
}

// Fecha a conexão
$mysqli->close();
?>
