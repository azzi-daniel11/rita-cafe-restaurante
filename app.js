
const mp = new MercadoPago('APP_USR-c5f72f5a-8687-4b24-82d2-e50f529f9f1f',{
    locale: "es-AR"
});


const precio = Number(document.querySelector(".price").innerText);

document.getElementById('checkout-btn').addEventListener("click", async () => {
    try{
        //---
            // Selecciona el elemento <p> por su id
                const totalElement = document.getElementById("total");

                // Obtiene el texto del elemento, por ejemplo, "Total: $0"
                const totalText = totalElement.textContent;

                // Usa una expresión regular para extraer solo los números
                const totalValue = totalText.match(/\d+/)[0];

                // Convierte el valor a número si necesitas hacer cálculos
                const totalNumber = parseInt(totalValue, 10);

                console.log(totalNumber); // Muestra el número, por ejemplo, 0

        //---

        const orderData = {
            title: document.querySelector(".name").innerText,
            quantity: 1,
            price: totalNumber,
        };
    
        const response = await fetch("http://192.168.0.158:3000/create_preference",{
            method: "POST",
            headers:{
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
        });
    
        const preference = await response.json();
        createCheckoutButton(preference.id);
    } catch(error){
        alert("Error :(")
    }

});


const createCheckoutButton = (preferenceId) => {
    const bricksBuilder = mp.bricks();
   
    const renderComponent = async () => {
        // Si ya existe un botón, lo desmontamos
        if (window.checkoutButton) {
            window.checkoutButton.unmount();
        }

        // Crear y asignar el botón a `window.checkoutButton`
        window.checkoutButton = await bricksBuilder.create("wallet", "wallet_container", {
            initialization: {
                preferenceId: preferenceId,
            },
        });
    };

    renderComponent();
};




document.getElementById('checkout-btn').addEventListener('click', () => {
    document.querySelector('.enviar-pedido').click();
    document.getElementById('pagoEfectivo').classList.remove('esconder')
});


// Mueve esta parte del código fuera de cualquier función repetitiva
document.addEventListener("DOMContentLoaded", () => {
    // Usamos socket.once para asegurarnos de que se ejecute solo una vez
    socket.once("pagoConfirmado", () => {
        const pedidoPendiente = JSON.parse(localStorage.getItem('pedidoPendiente'));
        if (pedidoPendiente) {
            // Emitir el pedido al servidor
            socket.emit('nuevoPedido', pedidoPendiente);

            // Limpiar el carrito y el pedido pendiente
            carrito = [];
            actualizarCarrito();
            vaciarCarrito();
            vaciarProductosSeleccionados();

            // Eliminar el pedido almacenado en localStorage
            localStorage.removeItem('pedidoPendiente');

            console.log('Pedido enviado y localStorage limpiado después de pago confirmado')           
        }
    });

});

var contenedorPago = document.getElementById('contenedor-pago')
setTimeout(() => {
    document.getElementById('cerrar-contenedor-pago').addEventListener('click', function() {
        contenedorPago.classList.add('ocultar')

console.log('Se hizo clic');

});
}, "40");


document.getElementById('ingresar-correo').addEventListener('click', ()=>{
        const correoCliente = document.getElementById('correo-cliente').value;
        console.log(correoCliente);
        document.getElementById('solicitar-correo').classList.add('ocultar');
        socket.emit('direccionDeCorreo', correoCliente);

})
