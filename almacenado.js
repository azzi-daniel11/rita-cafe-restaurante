// Función para guardar el carrito en localStorage
function guardarCarritoEnLocalStorage() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Función para cargar el carrito desde localStorage
function cargarCarritoDesdeLocalStorage() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarCarrito(); // Llamar a la función original para actualizar la interfaz
    }
}

// Guardar el carrito cada vez que se actualiza
document.querySelectorAll('.producto').forEach(div => {
    div.addEventListener('click', function() {
        guardarCarritoEnLocalStorage(); // Guardar el carrito en localStorage después de cada click
    });
});

// Cargar el carrito al cargar la página
window.addEventListener('load', function() {
    cargarCarritoDesdeLocalStorage(); // Cargar los datos guardados al iniciar la página
});

function vaciarCarrito() {
    carrito = []; // Vaciar el array carrito
    localStorage.removeItem('carrito'); // Eliminar el carrito de localStorage
    actualizarCarrito(); // Actualizar la interfaz para reflejar el carrito vacío
}



function cargarEstadoSolicitado() {
    const estadoProcesoSolicitado = localStorage.getItem('pedidoSolicitado');
    if (estadoProcesoSolicitado === 'realizado') {
        const pedidoSolicitado = document.getElementById('pedido-solicitado');
        pedidoSolicitado.classList.add('proceso-realizado'); // Volver a aplicar la clase si el estado es "realizado"
    }
}


function cargarEstadoProceso() {
    const estadoProceso = localStorage.getItem('pedidoEnProceso');
    if (estadoProceso === 'realizado') {
        const pedidoEnProceso = document.getElementById('pedido-en-proceso');
        pedidoEnProceso.classList.add('proceso-realizado'); // Volver a aplicar la clase si el estado es "realizado"
    }
}


function cargarEstadoListo() {
    const estadoProceso = localStorage.getItem('pedidoListo');
    if (estadoProceso === 'realizado') {
        const pedidoEnProceso = document.getElementById('pedido-listo');
        pedidoEnProceso.classList.add('proceso-realizado'); // Volver a aplicar la clase si el estado es "realizado"
    }
}

window.addEventListener('load', function() {
    cargarEstadoSolicitado();
    cargarEstadoProceso();
    cargarEstadoListo()
    
});



// Función para eliminar el estado del proceso de localStorage y remover las clases
function eliminarEstadoProceso() {
    // Eliminar los estados del localStorage
    localStorage.removeItem('pedidoEnProceso');
    localStorage.removeItem('pedidoListo');
    localStorage.removeItem('pedidoSolicitado');

    // Remover las clases de los elementos
    const pedidoEnProceso = document.getElementById('pedido-en-proceso');
    pedidoEnProceso.classList.remove('proceso-realizado');

    const pedidoListo = document.getElementById('pedido-listo');
    pedidoListo.classList.remove('proceso-realizado');

    const pedidoSolicitado = document.getElementById('pedido-solicitado');
    pedidoSolicitado.classList.remove('proceso-realizado');
}

// Agregar event listener al botón
document.getElementById('eliminarEstado').addEventListener('click', eliminarEstadoProceso);



// Inicializar la cantidad de productos
let cantidadProductos = parseInt(document.getElementById('contador-valor').innerText) || 0;

// Función para guardar la cantidad de productos en localStorage
function guardarCantidadProductos() {
    localStorage.setItem('cantidadProductos', JSON.stringify(cantidadProductos));
}

// Función para cargar la cantidad de productos desde localStorage
function cargarCantidadProductosLocalStorage() {
    const productosGuardados = localStorage.getItem('cantidadProductos');
    if (productosGuardados) {
        cantidadProductos = JSON.parse(productosGuardados);
        actualizarProductosGuardados(); // Llamar a la función para actualizar la interfaz
    }
}

//Guardado de contador de productos

// Función para actualizar el contador visual
function actualizarProductosGuardados() {
    document.getElementById('contador-valor').textContent = cantidadProductos;
    // Mostrar u ocultar el contador visual según la cantidad de productos
    const contadorVisualContenedor = document.getElementById('contador-visual');
    if (cantidadProductos > 0) {
        contadorVisualContenedor.classList.remove('ocultar');
    } else {
        contadorVisualContenedor.classList.add('ocultar');
    }
}

// Guardar la cantidad de productos cada vez que se actualiza
document.querySelectorAll('.producto').forEach(div => {
    div.addEventListener('click', function() {
        cantidadProductos++;
        actualizarProductosGuardados(); // Actualizar la cantidad en pantalla
        guardarCantidadProductos(); // Guardar en localStorage después de cada clic
    });
});

// Delegar el evento de eliminar a través del contenedor principal
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('botonEliminar')) {
        if (cantidadProductos > 0) {
            cantidadProductos--;
            actualizarProductosGuardados(); // Actualizar la cantidad en pantalla
            guardarCantidadProductos(); // Guardar en localStorage después de eliminar
        }
    }
});

// Cargar la cantidad de productos al cargar la página
window.addEventListener('load', function() {
    cargarCantidadProductosLocalStorage(); // Cargar los datos guardados al iniciar la página
});

function vaciarProductosSeleccionados() {
    cantidadProductos = 0; // Vaciar el array carrito
    localStorage.removeItem('cantidadProductos'); // Eliminar el carrito de localStorage
    actualizarProductosGuardados(); // Actualizar la interfaz para reflejar el carrito vacío
}

//Guardar correo:

document.addEventListener('DOMContentLoaded', function() {
    const solicitarCorreoDiv = document.getElementById('solicitar-correo');
    const correoInput = document.getElementById('correo-cliente');
    const ingresarCorreoBtn = document.getElementById('ingresar-correo');

    // Verificar si ya hay un correo guardado en localStorage
    const correoGuardado = localStorage.getItem('correoCliente');
    if (correoGuardado) {
        // Si hay un correo guardado, ocultar el div solicitando correo
        solicitarCorreoDiv.classList.add('ocultar');
    }

    // Evento para guardar el correo al hacer clic en el botón
    ingresarCorreoBtn.addEventListener('click', function() {
        const correoCliente = correoInput.value.trim();

        if (correoCliente) {
            // Guardar el correo en localStorage
            localStorage.setItem('correoCliente', correoCliente);

            // Ocultar el div solicitando correo después de guardar
            solicitarCorreoDiv.classList.add('ocultar');

            // Emitir el correo al servidor usando WebSocket si es necesario
            if (typeof socket !== 'undefined') {
                socket.emit('direccionDeCorreo', correoCliente);
            }

            console.log(`Correo guardado: ${correoCliente}`);
        } else {
            alert('Por favor, ingrese un correo válido.');
        }
    });
});





