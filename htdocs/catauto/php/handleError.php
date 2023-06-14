<?php
ini_set('SMTP','smtp.aaa.bbb.ar');

$time = date("h:i:s A");

$mail_to = 'admin@aaa.bbb.ar';
$subject = "[$_GET['userID'] - $time] Catalis ha generado un error";
$body = '';
$body .= "time: $time\r\n";
$body .= "userID: $_GET['userID']\r\n";
$body .= "errorMessage: $_GET['errorMessage']\r\n";
$body .= "url: $_GET['url']\r\n";
$body .= "line: $_GET['line']\r\n";
$body .= "db: $_GET['db']\r\n";
$body .= "recordID: $_GET['recordID']r\n";
$body .= "userAgent: $_GET['userAgent']\r\n";
$body .= "REMOTE_ADDR: $_SERVER['REMOTE_ADDR']\r\n";
$body .= "HTTP_X_FORWARDED_FOR: $_SERVER['HTTP_X_FORWARDED_FOR']\r\n";

$headers = "From: catalis@aaa.bbb.ar\r\n" ;

$returnCode = mail($mail_to, $subject, $body, $headers);

/*
if ($returnCode)
  echo '<h3>El mensaje fue enviado satisfactoriamente.</h3>';
else
  echo '<h3>El mensaje no ha podido ser enviado. Por favor, vuelva a intentarlo.</h3>';
*/
?>
