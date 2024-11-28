document.addEventListener('DOMContentLoaded', async () => {
    const socket = io('http://localhost:3000'); // Conectar al servidor WebSocket

    try {
        // 1. Obtener los productos iniciales y procesarlos
        const response = await fetch('http://localhost:3000/api/productos');
        if (!response.ok) throw new Error('Error al obtener los datos de los productos');
        const productosDisponibles = await response.json();

        // 2. Actualizar la visibilidad inicial de los productos
        const productosDOM = document.querySelectorAll('.producto');

        const actualizarDisponibilidad = (producto, disponible) => {
            if (disponible === 0) {
                producto.classList.add('esconder');
            } else {
                producto.classList.remove('esconder');
            }
        };

        productosDOM.forEach(producto => {
            const nombreProducto = producto.dataset.producto;

            const productoData = productosDisponibles.find(item => item.nombre === nombreProducto);
            if (productoData) {
                actualizarDisponibilidad(producto, productoData.disponible);
            } else {
                console.warn(`Producto "${nombreProducto}" no encontrado en los datos del servidor.`);
            }
        });

        // 3. Escuchar actualizaciones en tiempo real
        socket.on('actualizarProducto', ({ nombre, disponible }) => {
            const producto = Array.from(productosDOM).find(p => p.dataset.producto === nombre);
            if (producto) {
                actualizarDisponibilidad(producto, disponible);
                console.log(`Producto "${nombre}" actualizado a ${disponible ? 'disponible' : 'no disponible'}`);
            }
        });
    } catch (error) {
        console.error('Error al inicializar los productos:', error);
    }
});

