
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../conexao.php';

// Lista de tabelas necessárias
$required_tables = [
    'financeiro',
    'reservas',
    'quartos',
    'hospedes',
    'relatorios'
];

$missing_tables = [];

// Verificar cada tabela
foreach ($required_tables as $table) {
    $check = $conexao->query("SHOW TABLES LIKE '$table'");
    if ($check->num_rows == 0) {
        // Se a tabela não existir, adiciona à lista de tabelas faltantes
        $missing_tables[] = $table;
        
        // Criar a tabela com estrutura básica
        switch ($table) {
            case 'financeiro':
                $sql = "CREATE TABLE financeiro (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    id_reserva INT,
                    tipo VARCHAR(50) NOT NULL,
                    valor DECIMAL(10,2) NOT NULL,
                    descricao TEXT,
                    data_transacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )";
                break;
            case 'relatorios':
                $sql = "CREATE TABLE relatorios (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nome VARCHAR(100) NOT NULL,
                    tipo VARCHAR(50) NOT NULL,
                    caminho VARCHAR(255) NOT NULL,
                    data_inicio DATE NOT NULL,
                    data_fim DATE NOT NULL,
                    data_geracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )";
                break;
            case 'reservas':
                $sql = "CREATE TABLE reservas (
                    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    codigo VARCHAR(20) NOT NULL,
                    id_quarto INT(11) NOT NULL,
                    id_hospede INT(11) NOT NULL,
                    nome_hospede VARCHAR(100),
                    data_checkin DATE NOT NULL,
                    data_checkout DATE NOT NULL,
                    numero_hospedes INT(2) NOT NULL,
                    valor_total DECIMAL(10,2) NOT NULL,
                    valor_pago DECIMAL(10,2) DEFAULT 0,
                    status_pagamento VARCHAR(20) DEFAULT 'pendente',
                    observacoes TEXT,
                    status VARCHAR(20) DEFAULT 'confirmada',
                    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )";
                break;
            case 'quartos':
                $sql = "CREATE TABLE quartos (
                    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    nome VARCHAR(100) NOT NULL,
                    tipo VARCHAR(50) NOT NULL,
                    preco DECIMAL(10,2) NOT NULL,
                    capacidade INT(2) NOT NULL,
                    tamanho DECIMAL(6,2),
                    descricao TEXT,
                    imagem VARCHAR(255),
                    status VARCHAR(20) DEFAULT 'disponivel'
                )";
                // Inserir alguns quartos de exemplo
                $conexao->query($sql);
                $conexao->query("INSERT INTO quartos (nome, tipo, preco, capacidade, descricao, status) 
                                VALUES 
                                ('Quarto Standard', 'standard', 100.00, 2, 'Quarto confortável com vista para o jardim', 'disponivel'),
                                ('Quarto Luxo', 'luxo', 200.00, 2, 'Quarto espaçoso com vista para o mar', 'disponivel'),
                                ('Suite Master', 'suite', 300.00, 4, 'Suite completa com sala de estar e jacuzzi', 'disponivel')");
                continue;
                break;
            case 'hospedes':
                $sql = "CREATE TABLE hospedes (
                    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    nome VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    telefone VARCHAR(20) NOT NULL,
                    documento VARCHAR(20),
                    nacionalidade VARCHAR(50),
                    data_nascimento DATE,
                    endereco TEXT,
                    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )";
                break;
            default:
                $sql = "";
        }
        
        if (!empty($sql)) {
            $conexao->query($sql);
        }
    }
}

// Verificar se as tabelas foram criadas com sucesso
$still_missing = [];
foreach ($missing_tables as $table) {
    $check = $conexao->query("SHOW TABLES LIKE '$table'");
    if ($check->num_rows == 0) {
        $still_missing[] = $table;
    }
}

echo json_encode([
    'success' => count($still_missing) === 0,
    'missing_tables' => $still_missing,
    'created_tables' => array_diff($missing_tables, $still_missing)
]);

$conexao->close();
?>
<?php
// Caminho: C:\pousada\backend\admin\check_tables.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require '../conexao.php';

// Lista de tabelas necessárias
$required_tables = [
    'financeiro',
    'reservas',
    'quartos',
    'hospedes',
    'relatorios'
];

$missing_tables = [];
$created_tables = [];

// Verificar cada tabela
foreach ($required_tables as $table) {
    $check = $conexao->query("SHOW TABLES LIKE '$table'");
    if ($check->num_rows == 0) {
        // Tabela não existe, tentar criar
        $missing_tables[] = $table;
        $sql = "";

        switch ($table) {
            case 'financeiro':
                $sql = "CREATE TABLE financeiro (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    id_reserva INT,
                    tipo VARCHAR(50) NOT NULL,
                    valor DECIMAL(10,2) NOT NULL,
                    descricao TEXT,
                    data_transacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )";
                break;

            case 'relatorios':
                $sql = "CREATE TABLE relatorios (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nome VARCHAR(100) NOT NULL,
                    tipo VARCHAR(50) NOT NULL,
                    caminho VARCHAR(255) NOT NULL,
                    data_inicio DATE NOT NULL,
                    data_fim DATE NOT NULL,
                    data_geracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )";
                break;

            case 'reservas':
                $sql = "CREATE TABLE reservas (
                    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    codigo VARCHAR(20) NOT NULL,
                    id_quarto INT(11) NOT NULL,
                    id_hospede INT(11) NOT NULL,
                    nome_hospede VARCHAR(100),
                    data_checkin DATE NOT NULL,
                    data_checkout DATE NOT NULL,
                    numero_hospedes INT(2) NOT NULL,
                    valor_total DECIMAL(10,2) NOT NULL,
                    valor_pago DECIMAL(10,2) DEFAULT 0,
                    status_pagamento VARCHAR(20) DEFAULT 'pendente',
                    observacoes TEXT,
                    status VARCHAR(20) DEFAULT 'confirmada',
                    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )";
                break;

            case 'quartos':
                $sql = "CREATE TABLE quartos (
                    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    nome VARCHAR(100) NOT NULL,
                    tipo VARCHAR(50) NOT NULL,
                    preco DECIMAL(10,2) NOT NULL,
                    capacidade INT(2) NOT NULL,
                    tamanho DECIMAL(6,2),
                    descricao TEXT,
                    imagem VARCHAR(255),
                    status VARCHAR(20) DEFAULT 'disponivel'
                )";
                if ($conexao->query($sql)) {
                    $conexao->query("INSERT INTO quartos (nome, tipo, preco, capacidade, descricao, status) 
                        VALUES 
                        ('Quarto Standard', 'standard', 100.00, 2, 'Quarto confortável com vista para o jardim', 'disponivel'),
                        ('Quarto Luxo', 'luxo', 200.00, 2, 'Quarto espaçoso com vista para o mar', 'disponivel'),
                        ('Suite Master', 'suite', 300.00, 4, 'Suite completa com sala de estar e jacuzzi', 'disponivel')");
                    $created_tables[] = $table;
                }
                continue 2; // Pular para o próximo item do foreach
                break;

            case 'hospedes':
                $sql = "CREATE TABLE hospedes (
                    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    nome VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    telefone VARCHAR(20) NOT NULL,
                    documento VARCHAR(20),
                    nacionalidade VARCHAR(50),
                    data_nascimento DATE,
                    endereco TEXT,
                    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )";
                break;
        }

        // Executa criação da tabela, se aplicável
        if (!empty($sql)) {
            if ($conexao->query($sql)) {
                $created_tables[] = $table;
            }
        }
    }
}

// Verifica se ainda há tabelas faltando após as tentativas de criação
$still_missing = [];
foreach ($missing_tables as $table) {
    $check = $conexao->query("SHOW TABLES LIKE '$table'");
    if ($check->num_rows == 0) {
        $still_missing[] = $table;
    }
}

echo json_encode([
    'success' => count($still_missing) === 0,
    'missing_tables' => $still_missing,
    'created_tables' => $created_tables
]);

$conexao->close();
