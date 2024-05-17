import  pg  from 'pg';
const { Pool } = pg;

// conexion a la base de dato 

const pool = new Pool({
    user:'postgres',
    host: 'localhost',
    password: '1234',
    database: 'Banco',
    port: 5432

})

// registrar una nueva transferencia
async function nuevaTransferencia(descripcion, fecha, monto, cuenta_origen, cuenta_destino) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('INSERT INTO transferencias (descripcion, fecha, monto, cuenta_origen, cuenta_destino) VALUES ($1, $2, $3, $4, $5)', [descripcion, fecha, monto, cuenta_origen, cuenta_destino]);
    await client.query('UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2', [monto, cuenta_origen]);
    await client.query('UPDATE cuentas SET saldo = saldo + $1 WHERE id = $2', [monto, cuenta_destino]);
    await client.query('COMMIT');

    const resultadoTrasferencia = await client.query('SELECT * FROM transferencias ORDER BY fecha DESC LIMIT 1');
    console.log('Última transferencia registrada:');
    console.table(resultadoTrasferencia.rows);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en la transacción:', error);
  } 

}

//consultar las últimas 10 transferencias de una cuenta
async function consultaPorCuenta(cuenta) {
  try {
    const consulta = await pool.query('SELECT * FROM transferencias WHERE cuenta_origen = $1 OR cuenta_destino = $1 ORDER BY fecha DESC LIMIT 10', [cuenta]);
    console.log('Últimas 10 transferencias para la cuenta', cuenta + ':');
    console.table(consulta.rows);
  } catch (error) {
    console.error('Error al consultar las transferencias:', error);
  }
}

//consultar el saldo de una cuenta
async function consultarSaldo(cuenta) {
  try {
    const totalSaldo = await pool.query('SELECT saldo FROM cuentas WHERE id = $1', [cuenta]);
    console.log('Saldo de la cuenta', cuenta + ':', totalSaldo.rows[0].saldo);
  } catch (error) {
    console.error('Error al consultar el saldo:', error);
  }
}

// Función que ejecuta la función correspondiente según los argumentos de línea de comando
async function operacion() {
  const argumentos = process.argv.slice(2);
  const comando = argumentos[0];

  switch (comando) {
    case 'nueva':
      await nuevaTransferencia(...argumentos.slice(1));
      break;
    case 'consultaPorCuenta':
      await consultaPorCuenta(...argumentos.slice(1));
      break;
    case 'consultarSaldo':
      await consultarSaldo(...argumentos.slice(1));
      break;
    default:
      console.error('Comando no válido.');
  }
}

operacion()


// node index.js nueva "Pago de factura" "2024-05-16" 500 1 2
// node index.js nueva "Pago de boleta" "2024-05-16" 15 1 2
// node index.js nueva "Pago de factura" "2024-05-16" 200 2 1
// node index.js nueva "Pago de boleta" "2024-05-16" 150 2 1
// node index.js nueva "Pago de factura" "2024-05-16" 10 1 2

// cree dos cuentas la 3 y 4 para mejorar la diferenciación entre las cuentas al revisar las transferencias
// node index.js nueva "Pago de factura" "2024-05-16" 300 1 4
// node index.js nueva "Pago de factura" "2024-05-16" 300 2 3


// node index.js consultaPorCuenta 1
// node index.js consultaPorCuenta 2

//node index.js consultarSaldo 1
//node index.js consultarSaldo 2













////////////////////////////////////// codigo trabajado en clases  /////////////////////////////////////////
// const argumentos = process.argv.slice(2) // acortamos los dos primero elemntos del array 
// const operacion = argumentos[0] // argumento de la posicion 0 //nueva
// const cuenta = argumentos[1]  //1
// const fecha = argumentos[2] // "15/05/2024"
// const descripcion = argumentos[3] // "Comprar Pizza"
// const monto = argumentos[4] //"9990"



// // node index.js nueva 1 "15/05/2024" "Comprar Pizza" "9990"
// console.log('Salida de argumentos ------> ', argumentos )

// pool.connect( async (error, client, release) => {

//     if(error){
//         return console.error("Error de conexion : ", error.stack )
//     }

//     switch (operacion) {
//         case "nueva":
//             console.log(' Cuenta nueva ')
//             await nuevaCuenta(client, descripcion, fecha, monto, cuenta )
//             break;

//         default:
//             console.log('Ingrese una operacion correcta ..... ')
//                 break;
            
//     }
// })

// // hacemos nuestra funcion nuevaCuenta
// // la hacemos como funcion si queremos con funciion de flecha tiene que ser arriba del pool

// async function nuevaCuenta(client, descripcion, fecha, monto, cuenta){
//     //meter el begin aca 
//     const actualizar ={
//         name : "actualizar-cuenta",
//         text : "UPDATE cuentas Set saldo =  saldo - $1 WHERE id= $2 returning *",
//         values : [ monto, cuenta ]
//     }

//     const nueva = {
//         name : "nueva-cuenta",
//         text : "INSERT INTO transacciones Values ($1, $2, $3, $4 ) returning *",
//         values : [ descripcion, fecha, monto, cuenta ]
//     }


//     try {
//         await client.query("BEGIB");
//         const result = await client.query(nueva);
//         await client.query(actualizar);
//         await client.query("COMMIT");
//         console.log(" transaccion realiza con exito !!")
//         console.log(" ultima transaccion realiza :", result.row[0])
//     } catch (error) {
//         await client.query("ROLLBACK");
//         console.log(`ERROR codigo ${error.code}`);

//     }
// }
