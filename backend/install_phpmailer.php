
<?php
// Script para instalar PHPMailer via Composer
header('Content-Type: text/html; charset=UTF-8');
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instalação do PHPMailer</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        pre {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .success {
            color: green;
            font-weight: bold;
        }
        .error {
            color: red;
            font-weight: bold;
        }
        code {
            background-color: #f5f5f5;
            padding: 2px 5px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <h1>Instalação do PHPMailer</h1>
    
    <div>
        <h2>Instruções para instalar o PHPMailer</h2>
        
        <p>O PHPMailer é necessário para o envio de e-mails de confirmação de reserva. Siga as instruções abaixo para instalá-lo:</p>
        
        <h3>1. Verifique se o Composer está instalado</h3>
        <p>O Composer é um gerenciador de dependências para PHP. Para verificar se ele está instalado, execute o comando:</p>
        <pre>composer --version</pre>
        
        <h3>2. Instale o PHPMailer</h3>
        <p>Na pasta raiz do seu projeto, execute:</p>
        <pre>composer require phpmailer/phpmailer</pre>
        
        <h3>3. Configure as credenciais de e-mail</h3>
        <p>Após a instalação, edite o arquivo <code>backend/criar_reserva.php</code> e atualize as configurações de SMTP:</p>
        <pre>
$mail->Host       = 'smtp.seu-provedor.com'; // Ex: smtp.gmail.com
$mail->Username   = 'seu-email@exemplo.com';
$mail->Password   = 'sua-senha';
        </pre>
        
        <h3>4. Teste o envio de e-mail</h3>
        <p>Realize uma reserva de teste para verificar se o envio de e-mail está funcionando corretamente.</p>
    </div>
    
    <div>
        <h2>Verificação de Status</h2>
        
        <?php
        // Verificar se o Composer está instalado
        if (file_exists('../composer.json')) {
            echo "<p class='success'>✓ Composer encontrado no projeto</p>";
        } else {
            echo "<p class='error'>✗ composer.json não encontrado. O Composer pode não estar instalado.</p>";
        }
        
        // Verificar se o PHPMailer está instalado
        if (file_exists('../vendor/phpmailer/phpmailer/src/PHPMailer.php')) {
            echo "<p class='success'>✓ PHPMailer está instalado</p>";
        } else {
            echo "<p class='error'>✗ PHPMailer não está instalado. Execute: composer require phpmailer/phpmailer</p>";
        }
        
        // Verificar configurações de e-mail
        $reservaFile = file_get_contents('criar_reserva.php');
        if (strpos($reservaFile, 'smtp.example.com') !== false) {
            echo "<p class='error'>✗ Configurações de SMTP padrão detectadas. Atualize-as com suas informações.</p>";
        } else if (strpos($reservaFile, '$mail->Host') !== false) {
            echo "<p class='success'>✓ Configurações de SMTP personalizadas encontradas</p>";
        }
        ?>
    </div>
</body>
</html>
