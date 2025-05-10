
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:8080');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require '../conexao.php';

// Pegar o idioma da requisição (padrão: en)
$lang = isset($_GET['lang']) ? $_GET['lang'] : 'en';

// Parâmetros de filtragem opcionais
$busca = isset($_GET['busca']) ? $conexao->real_escape_string($_GET['busca']) : '';

// Constrói a query com filtros
$sql = "SELECT * FROM hospedes WHERE 1=1";

if (!empty($busca)) {
    $sql .= " AND (nome LIKE '%$busca%' OR email LIKE '%$busca%' OR telefone LIKE '%$busca%' OR documento LIKE '%$busca%')";
}

// Ordenação
$sql .= " ORDER BY nome ASC";

$resultado = $conexao->query($sql);

$hospedes = [];
if ($resultado && $resultado->num_rows > 0) {
    while($row = $resultado->fetch_assoc()) {
        $hospedes[] = $row;
    }
} else {
    // Return empty array even when no results or error occurs
    $hospedes = [];
}

echo json_encode($hospedes);

$conexao->close();
?>
