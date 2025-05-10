<?php
// Caminho: C:\xampps\htdocs\pougar\backend\admin\testar_email.php

header('Access-Control-Allow-Origin: http://localhost:8080');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once '../vendor/autoload.php';


use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$data = json_decode(file_get_contents("php://input"), true);

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = $data['host'];
    $mail->SMTPAuth = true;
    $mail->Username = $data['username'];
    $mail->Password = $data['password'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = $data['port'];
    $mail->setFrom($data['from'], 'Sistema Pousada');
    $mail->addAddress($data['to'], 'Teste');
    $mail->Subject = 'Teste de Email';
    $mail->Body    = 'Este é um teste de envio de e-mail.';

    $mail->send();

    echo json_encode(['success' => true, 'message' => 'E-mail enviado com sucesso.']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => "Erro ao enviar: {$mail->ErrorInfo}"]);
}
