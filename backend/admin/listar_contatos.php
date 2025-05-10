
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../conexao.php';

// Pegar o idioma da requisição (padrão: en)
$lang = isset($_GET['lang']) ? $_GET['lang'] : 'en';

// Parâmetros de filtragem opcionais
$status = isset($_GET['status']) ? $conexao->real_escape_string($_GET['status']) : '';
$busca = isset($_GET['busca']) ? $conexao->real_escape_string($_GET['busca']) : '';

// Constrói a query com filtros
$sql = "SELECT * FROM contatos WHERE 1=1";

if (!empty($status)) {
    $sql .= " AND status = '$status'";
}

if (!empty($busca)) {
    $sql .= " AND (nome LIKE '%$busca%' OR email LIKE '%$busca%' OR mensagem LIKE '%$busca%')";
}

// Ordenação
$sql .= " ORDER BY data_criacao DESC";

$resultado = $conexao->query($sql);

$contatos = [];
if ($resultado->num_rows > 0) {
    while($row = $resultado->fetch_assoc()) {
        $contatos[] = $row;
    }
}

echo json_encode($contatos);

$conexao->close();
?>
