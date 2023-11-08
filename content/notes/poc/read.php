<?php
$fp = fopen("/etc/passwd","r");
if($fp)
{
echo 'ok!';
$result = fread($fp,
8192);
return $result;
echo $result;
}
else
{
echo 'no!';
}


echo file_get_contents("php://filter/read=string.toupper|string.rot13|string.tolower/resource=file:///etc/passwd");


$output = array();
$command = "cat /etc/passwd | cut -d\":\" -f1";
 echo 'running the command: <b>'.$command."</b><br />";
exec($command, &$output);
echo implode("<br />\n", $output);

?>