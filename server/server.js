import http from 'http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import { MercadoPagoConfig, Preference} from 'mercadopago';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const client = new MercadoPagoConfig({ accessToken: 'APP_USR-7144616113486457-110719-6a9f6ae802b40ab7ac28b9cccb61997d-2085322270'});
// Crear una aplicación Express
const app = express();
const port = 3000;

// Configurar middleware
app.use(cors());
app.use(express.json());

// Crear servidor HTTP
const server = http.createServer(app);

// Crear instancia de Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*",  // Permitir conexiones desde cualquier origen
        methods: ["GET", "POST"]
    }
});

let correoCliente = '';
// Manejar conexiones WebSocket
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado:', socket.id);

    // Escuchar la dirección de correo enviada por el cliente
    socket.on('direccionDeCorreo', (correo) => {
        correoCliente = correo; // Guardar el correo recibido en la variable global
        console.log(`El correo del cliente es: ${correoCliente}`);
        io.emit('direccionDeCorreo', { 
            mensaje: 'Correo del cliente recibido' 
        });
    });

    socket.on('nuevoPedido', (pedido) => {
        console.log('Nuevo pedido recibido:', pedido);
// Verificar si el correoCliente está definido antes de enviar el correo
if (correoCliente) {
    enviarTicket(correoCliente, pedido);
} else {
    console.error('No se puede enviar el ticket: correo del cliente no proporcionado.');
}

// Emitir el pedido a todos los clientes conectados
io.emit('actualizarPedido', pedido);

    });

    socket.on('Pedido en proceso', (pedido) => {
        console.log(`El pedido de la mesa ${pedido.mesa} está en proceso`);
        io.emit('pedidoEnProceso', { 
            mensaje: 'El pedido está en proceso', 
            mesa: pedido.mesa  
        });
    });

    socket.on('Pedido Listo', (pedido) => {
        console.log(`El pedido de la mesa ${pedido.mesa} está Listo`);
        io.emit('pedidoListo', { 
            mensaje: 'El pedido está Listo', 
            mesa: pedido.mesa  
        });
    });

    socket.on('pedidoEntregado', (pedido) => {
        console.log(`El pedido de la mesa ${pedido.mesa} fue entregado`);
        io.emit('pedidoEntregado', { 
            mensaje: 'El pedido fue entregado', 
            mesa: pedido.mesa  
        });
    });
    
    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

// Ruta principal
app.get("/", (req, res) => {
    res.send("Soy el server");
});

// Manejo de preferencias de MercadoPago
app.post("/create_preference", async (req, res) => {
    try {
        const body = {
            items: [{
                title: req.body.title,
                quantity: Number(req.body.quantity),
                unit_price: Number(req.body.price),
                currency_id: "ARS",
            }],
            back_urls: {
                success: "http://localhost/xampp/trabajo-integrador/?mesa=10",
                failure: "https://www.youtube.com/watch?v=zpzdgmqIHOQ&ab_channel=Madonna",
                pending: "https://www.youtube.com/watch?v=ViWr4rzBgXk&list=RDMM&start_radio=1&rv=zpzdgmqIHOQ&ab_channel=jessica37chan",
            },
            auto_return: "approved",
            notification_url: "https://91d7-2800-810-478-24da-6d7a-2a63-23e1-a58.ngrok-free.app/webhook"
        };

        const preference = new Preference(client);
        const result = await preference.create({ body });
        res.json({ id: result.id });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error al crear la preferencia" });
    }
});

app.post("/webhook", async function (req,res){
    const paymentId = req.query.id;

    try{
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`,{
            method: 'GET',
            headers:{
                'Authorization': `Bearer ${client.accessToken}`
            }
        });

        if(response.ok){
            const data = await response.json();
            console.log(data);
            io.emit("pagoConfirmado");
        }
        res.sendStatus(200);

    }catch (error){
        console.error('Error:' , error);
        res.sendStatus(500);
    }
})

// Iniciar el servidor
server.listen(port, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://${'192.168.0.158'}:${port}`);
});


//dotenv

// Configura MercadoPago con la clave de entorno
//mercadopago.configurations.setAccessToken(process.env.MERCADO_PAGO_KEY);


let pagoConfirmadoGlobal = false; // Variable global para almacenar el estado del pago

// Emitir el evento de pago confirmado y actualizar el estado
app.post("/webhook", async function (req, res) {
    const paymentId = req.query.id;

    try {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${client.accessToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();

            // Confirmar que el pago está aprobado
            if (data.status === "approved") {
                console.log('Pago confirmado:', data);

                // Emitir solo a la conexión específica usando `socket.id`
                io.emit("pagoConfirmado"); // Puedes personalizar para enviar solo al cliente correspondiente
            }
        }
        res.sendStatus(200);
    } catch (error) {
        console.error('Error:', error);
        res.sendStatus(500);
    }
});


// Endpoint para verificar si hubo un pago confirmado
app.get('/verificar-pago', (req, res) => {
    res.json({ pagoConfirmado: pagoConfirmadoGlobal });
});




//Enviar correo de factura al cliente

// Configuración del transportador (aquí usamos Gmail como ejemplo)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rita.cafe.resto@gmail.com', // Tu correo electrónico
    pass: 'txph xpkg kqqo pigo', // Tu contraseña de aplicación (NO la contraseña de tu cuenta)
  },
});

// Función para enviar el correo electrónico
function enviarTicket(correoDestino, pedido) {
    // Construir el cuerpo del correo
    let cuerpoCorreo = `Nuevo pedido de ${pedido.cliente}:\n\nProductos:\n`;
    let total = 0; // Inicializar el total en 0

    // Recorrer el carrito para agregar cada producto al cuerpo del correo y sumar el total
    pedido.carrito.forEach(item => {
        cuerpoCorreo += `${item.producto} - $${item.precio}\n`;
        total += item.precio; // Sumar el precio del producto al total
    });

    // Agregar el total al cuerpo del correo
    cuerpoCorreo += `\nTotal: $${total}\n`;
    cuerpoCorreo += `\n¡Gracias por su pedido en Rita Café & Restaurante!`;

    const mailOptions = {
        from: '"Rita Café & Restaurante" <rita.cafe.resto@gmail.com>',
        to: correoDestino,
        subject: `Nuevo pedido de ${pedido.cliente}`,
        text: cuerpoCorreo // Utilizar el cuerpo del correo formateado
    };

    // Enviar el correo
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.error('Error al enviar el correo:', error);
        }
        console.log('Correo enviado:', info.response);
    });
}


