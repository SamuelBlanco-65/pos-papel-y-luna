
window.onload = async function () {

    // Muestro el loader mientras cargo todo desde la API
    mostrarLoader("Conectando con el servidor...");

    try {
        // Cargo todas las listas en paralelo para ser mas rapido
        await Promise.all([
            cargarProductosDesdeAPI(),
            cargarVentasDesdeAPI(),
            cargarClientesDesdeAPI(),
            cargarProveedoresDesdeAPI(),
            cargarCategoriasDesdeAPI()
        ]);
    } catch (error) {
        mostrarNotificacion("Error al cargar datos: " + error.message, "error");
    } finally {
        ocultarLoader();
    }

    // Inicio una venta nueva vacia
    crearNuevaVenta();

    // Reviso si habia una venta abierta guardada
    actualizarBotonVentaAbierta();

    // Muestro la vista inicial
    mostrarVista("vista-nueva-venta");

    // Cierro modales al hacer clic en el fondo oscuro
    document.getElementById("modal-cobro").addEventListener("click", function (e) {
        if (e.target == this) cerrarModalCobro();
    });
    document.getElementById("modal-producto").addEventListener("click", function (e) {
        if (e.target == this) cerrarFormularioProducto();
    });
    document.getElementById("modal-eliminar").addEventListener("click", function (e) {
        if (e.target == this) cerrarModalEliminar();
    });
    document.getElementById("modal-entidad").addEventListener("click", function (e) {
        if (e.target == this) cerrarFormularioEntidad();
    });
    document.getElementById("modal-editar-en-venta").addEventListener("click", function (e) {
        if (e.target == this) cerrarFormularioProductoEnVenta();
    });
};
