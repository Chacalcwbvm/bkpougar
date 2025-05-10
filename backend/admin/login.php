
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require '../conexao.php';

// Verifica se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

// Obtém o corpo da requisição
$dados = json_decode(file_get_contents('php://input'), true);

// Verifica se email e senha foram fornecidos
if (!isset($dados['email']) || !isset($dados['senha'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'Email e senha são obrigatórios']);
    exit;
}

// Escapa os dados para evitar injeção SQL
$email = $conexao->real_escape_string($dados['email']);

// Busca o usuário pelo email
$sql = "SELECT id, nome, email, senha, cargo FROM usuarios WHERE email = '$email' AND status = 'ativo'";
$resultado = $conexao->query($sql);

if ($resultado->num_rows === 0) {
    http_response_code(401);
    echo json_encode(['erro' => 'Usuário não encontrado ou inativo']);
    exit;
}

$usuario = $resultado->fetch_assoc();

// Verifica a senha
if (!password_verify($dados['senha'], $usuario['senha'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'Senha incorreta']);
    exit;
}

// Remove a senha do objeto de usuário antes de enviar
unset($usuario['senha']);

// Atualiza a data do último login
$id = $usuario['id'];
$sql = "UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = $id";
$conexao->query($sql);

// Cria um token simples (em uma aplicação real, use JWT ou outro método seguro)
$token = bin2hex(random_bytes(32));

// Em uma aplicação real, armazene o token em um banco de dados ou cache
// Aqui estamos apenas simulando a autenticação

echo json_encode([
    'sucesso' => true,
    'token' => $token,
    'usuario' => $usuario,
    'mensagem' => 'Login realizado com sucesso'
]);

$conexao->close();
?>
