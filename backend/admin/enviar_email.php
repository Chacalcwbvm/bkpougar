<?php
// Caminho: C:\xampps\htdocs\pougar\backend\admin\testar_email.php
require_once '../vendor/autoload.php';
require_once __DIR__ . '/../conexao.php';
header('Access-Control-Allow-Origin: http://localhost:8080');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
$data = json_decode(file_get_contents("php://input"), true);
$mail = new PHPMailer(true);	



// Verifique se você está obtendo as configurações de email corretamente
$sql = "SELECT email_settings FROM configuracoes LIMIT 1";
$resultado = $conexao->query($sql);

if ($resultado && $resultado->num_rows > 0) {
    $row = $resultado->fetch_assoc();
    $emailSettings = json_decode($row['email_settings'], true);

    // Criar uma instância do PHPMailer
    

    try {
		$mail = new PHPMailer(true);
        $mail->CharSet = 'UTF-8';
		        $mail->isSMTP();
        $mail->Host = $emailSettings['smtpServer'];
        $mail->SMTPAuth = true;
        $mail->Username = $emailSettings['emailSender'];
        $mail->Password = $emailSettings['smtpPassword'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = $emailSettings['smtpPort'];

        // Remetente
        $mail->setFrom($emailSettings['emailSender'], 'Pousada Pouso das Garças');
        $mail->addAddress('chacalcwb.vm@gmail.com'); // Destinatário

	      
        // Conteúdo do email
        $mail->isHTML(true);
        $mail->Subject = $data['assunto'] ?? 'Teste de Email';
        $mail->Body    = "Este é um e-mail de teste enviado pelo sistema Pousada Pouso das Garças.";

        // Enviar
        $mail->send();
        echo json_encode(['sucesso' => true, 'mensagem' => 'E-mail enviado com sucesso']);
    } catch (Exception $e) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Falha ao enviar e-mail. Erro: ' . $mail->ErrorInfo]);
    }
} else {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Não foi possível obter as configurações de e-mail']);
}
?>