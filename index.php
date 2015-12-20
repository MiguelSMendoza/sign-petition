<?php
require __DIR__ . '/vendor/autoload.php';
define("DBHOST", "localhost");
define("DBUSER", "anpeclme_alba");
define("DBPASS", "SRNuY3E4s8aMhTZP");
define("DBNAME", "anpeclme_albacete");

$app = new CyberREST("Sign");

$app->get("/Form", function($app) {
	header("Location: dist/form.html");
	die();
});

$app->get("/Validate", function($app) {
	$params = $app->getParameters();
	$dni = $params["form_sign_dni"];
	if(!checkValidNIF($dni)) {
		$app->response("El NIF introducido NO es válido.",400);
	} else {
		$app->response("",200);
	}
});

$app->post("/", function($app) {
	$whiteList = ["anpe-albacete.com","netrunners.es"];
	if(!$app->checkRefererWhiteList($whiteList)) {
		returnError($app, "Host No Válido", 1);
	}
	$params = $app->getParameters();
	if(checkEmptyParams($params)) {
		returnError($app, "Rellene todos los campos para continuar", 2);
	}
	$dni = $params["form_sign_dni"];
	if(!checkValidNIF($dni)) {
		returnError($app, "El NIF introducido NO es válido. Compruébelo y vuelva a intentarlo.", 5);
	}
	$causa = $params["causa"];
	if(!checkCausa($causa)) {
		returnError($app, "Intento fallido.", 3);
	}
	if(checkExistsNIFInPetition($dni,$causa)) {
		returnError($app, "El NIF introducido ya se encuentra en la lista de firmas.", 4);
	}
	$ip = $app->getClientIP();
	$form = array (
		"DNI"=>$dni,
		"Nombre"=>$params["form_sign_nombre"],
		"Apellidos"=>$params["form_sign_apellidos"]
	);
	if(!storeSign($causa, $form, $ip)) {
		returnError($app, "Ha Ocurrido un Error Inesperado. Vuelva a Intentarlo más tarde.", 3);
	} else {
		$app->response(["errorcode"=>0,"status"=>1],200);
	}
});

function checkCausa($causa) {
	return in_array($causa, ["reduccioncee"]);
}

function checkValidNIF($dni) {
    if (strlen($dni) != 9 ||
        preg_match('/^[XYZ]?([0-9]{7,8})([A-Z])$/i', $dni, $matches) !== 1) {
        return false;
    }
    $map = 'TRWAGMYFPDXBNJZSQVHLCKE';
    list(, $number, $letter) = $matches;
    return strtoupper($letter) === $map[((int) $number) % 23];
}

function checkExistsNIFInPetition($dni, $causa) {
	$db = new CyberDB();
	$db->setDB(DBHOST, DBUSER, DBPASS, DBNAME);
	$query=&$db->getQuery();
	$query->Select("COUNT(*)");
	$query->From("wp_sign");
	$query->Where(["sign LIKE '%".$dni."%'","causa ='".$causa."'"]);
	$search = $db->getResult();
	return ($search>0);
}

function storeSign($causa, $form, $ip) {
	$db = new CyberDB();
	$db->setDB(DBHOST, DBUSER, DBPASS, DBNAME);
	$query=&$db->getQuery();
	$query->Insert("wp_sign");
	$query->Columns(["causa","sign","date","ip"]);
	$query->Values(["'". addslashes($causa)."'","'".json_encode($form)."'","NOW()","'".$ip."'"]);
	return $db->executeQuery();
}

function checkEmptyParams($params) {
	return (empty($params["form_sign_dni"]) || empty($params["form_sign_nombre"]) || empty($params["form_sign_apellidos"]));
}

function returnError($app, $error, $errorcode) {
	$response = array (
		"error"=>$error,
		"errorcode"=>$errorcode
	);
	$app->response($response,200);
}
	
	/*
		<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 3.2//EN">

		<html>
		<head>
		    <title></title>
		</head>
		
		<body>
			<iframe src="http://www.anpe-albacete.com/API/Sign/Form" width="400px" height="450px" frameborder="0" />
			
		</body>
		</html>
	*/
