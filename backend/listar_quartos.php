
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require 'conexao.php';

// Verificar se a tabela existe
$check_table = $conexao->query("SHOW TABLES LIKE 'quartos'");
if ($check_table->num_rows == 0) {
    // Se a tabela não existe, retorna um array vazio em vez de erro
    echo json_encode([]);
    exit;
}

$sql = "SELECT * FROM quartos";
$resultado = $conexao->query($sql);

$quartos = [];
if ($resultado && $resultado->num_rows > 0) {
    while($row = $resultado->fetch_assoc()) {
        $quartos[] = $row;
    }
}

// Sempre retorna um array, mesmo que vazio
echo json_encode($quartos);

$conexao->close();
?>
