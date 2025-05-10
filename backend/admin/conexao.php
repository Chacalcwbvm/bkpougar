<?php
$host = 'localhost';
$usuario = 'root';  // Usuário padrão do XAMPP
$senha = '';        // Senha padrão do XAMPP
$banco = 'pousada_viva';

$conexao = new mysqli($host, $usuario, $senha, $banco);

if ($conexao->connect_error) {
    die("Erro na conexão: " . $conexao->connect_error);
}
?>
