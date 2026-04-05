// =============================================
// PRODUCTOS.JS
// CRUD de productos integrado con Google Sheets.
// Cargar, crear y editar usan la API.
// Eliminar tambien actualiza la lista local.
// =============================================

// ---- TABLA ----

function cargarTablaProductos() {
    var vacioCaja = document.getElementById("productos-vacio");
    var tabla = document.getElementById("tabla-productos");
    var filas = document.getElementById("filas-productos");

    if (listaProductos.length == 0) {
        vacioCaja.classList.remove("oculto");
        tabla.classList.add("oculto");
        return;
    }

    vacioCaja.classList.add("oculto");
    tabla.classList.remove("oculto");

    var html = "";
    for (var i = 0; i < listaProductos.length; i++) {
        var prod = listaProductos[i];
        var textoStock = prod.controlInventario
            ? prod.stock + " und."
            : '<span style="color:#9a9087;font-size:11px">Sin seguimiento</span>';

        // Miniatura si el producto tiene imagen
        var imgHtml = prod.imagen && prod.imagen != ""
            ? '<img src="' + prod.imagen + '" class="img-producto-tabla" onerror="this.style.display=\'none\'">'
            : '<div class="img-producto-placeholder">📦</div>';

        html +=
            '<tr>' +
                '<td>' + imgHtml + '</td>' +
                '<td style="font-weight:500">' + prod.nombre + '</td>' +
                '<td style="color:#9a9087">' + prod.categoria + '</td>' +
                '<td class="texto-mono">' + formatearPrecio(prod.precio) + '</td>' +
                '<td class="texto-mono" style="color:#9a9087">' + formatearPrecio(prod.costo) + '</td>' +
                '<td>' + textoStock + '</td>' +
                '<td>' +
                    '<div style="display:flex;gap:5px">' +
                        '<button class="btn-tabla" onclick="abrirFormularioProducto(\'' + prod.id + '\')">✎ Editar</button>' +
                        '<button class="btn-tabla peligro" onclick="abrirModalEliminar(\'' + prod.id + '\')">✕ Eliminar</button>' +
                    '</div>' +
                '</td>' +
            '</tr>';
    }
    filas.innerHTML = html;
}


// ---- FORMULARIO ----

function abrirFormularioProducto(idONuevo) {
    var erroresDiv = document.getElementById("errores-formulario");
    erroresDiv.innerHTML = "";
    erroresDiv.classList.add("oculto");

    // Cargo categorias en el select
    var selectCat = document.getElementById("campo-categoria");
    selectCat.innerHTML = '<option value="">Selecciona una categoría</option>';
    for (var c = 0; c < listaCategorias.length; c++) {
        selectCat.innerHTML += '<option value="' + listaCategorias[c].nombre + '">' + listaCategorias[c].nombre + '</option>';
    }

    if (idONuevo == "nuevo") {
        idProductoEditando = null;
        document.getElementById("titulo-form-producto").textContent = "Nuevo Producto";
        document.getElementById("campo-nombre").value = "";
        document.getElementById("campo-categoria").value = "";
        document.getElementById("campo-precio").value = "";
        document.getElementById("campo-costo").value = "";
        document.getElementById("campo-inventario").value = "si";
        document.getElementById("campo-stock").value = "0";
        document.getElementById("campo-imagen").value = "";
        document.getElementById("grupo-stock").classList.remove("oculto");
    } else {
        idProductoEditando = idONuevo;
        var producto = null;
        for (var i = 0; i < listaProductos.length; i++) {
            if (listaProductos[i].id == idONuevo) {
                producto = listaProductos[i];
                break;
            }
        }
        if (producto == null) {
            mostrarNotificacion("No se encontró el producto", "error");
            return;
        }
        document.getElementById("titulo-form-producto").textContent = "Editar Producto";
        document.getElementById("campo-nombre").value = producto.nombre;
        document.getElementById("campo-categoria").value = producto.categoria;
        document.getElementById("campo-precio").value = producto.precio;
        document.getElementById("campo-costo").value = producto.costo;
        document.getElementById("campo-inventario").value = producto.controlInventario ? "si" : "no";
        document.getElementById("campo-stock").value = producto.stock || 0;
        document.getElementById("campo-imagen").value = producto.imagen || "";
        if (producto.controlInventario) {
            document.getElementById("grupo-stock").classList.remove("oculto");
        } else {
            document.getElementById("grupo-stock").classList.add("oculto");
        }
    }
    document.getElementById("modal-producto").classList.remove("oculto");
}

function cerrarFormularioProducto() {
    document.getElementById("modal-producto").classList.add("oculto");
    idProductoEditando = null;
}

function toggleCampoStock() {
    var valor = document.getElementById("campo-inventario").value;
    if (valor == "si") {
        document.getElementById("grupo-stock").classList.remove("oculto");
    } else {
        document.getElementById("grupo-stock").classList.add("oculto");
    }
}

async function guardarProducto() {
    var nombre = document.getElementById("campo-nombre").value.trim();
    var categoria = document.getElementById("campo-categoria").value.trim();
    var precioTexto = document.getElementById("campo-precio").value;
    var costoTexto = document.getElementById("campo-costo").value;
    var controlInventario = document.getElementById("campo-inventario").value == "si";
    var stockTexto = document.getElementById("campo-stock").value;
    var imagen = document.getElementById("campo-imagen").value.trim();

    var precio = parseFloat(precioTexto);
    var costo = parseFloat(costoTexto);
    var stock = parseInt(stockTexto);

    var errores = [];
    if (nombre == "") errores.push("El nombre del producto es obligatorio.");
    if (categoria == "") errores.push("La categoría es obligatoria.");
    if (precioTexto.length > 0 && precioTexto[0] == "0") {
        errores.push("El precio no puede empezar con cero.");
    } else if (isNaN(precio) || precio < 0) {
        errores.push("El precio debe ser un número mayor o igual a cero.");
    }
    if (costoTexto.length > 0 && costoTexto[0] == "0") {
        errores.push("El costo no puede empezar con cero.");
    } else if (isNaN(costo) || costo < 0) {
        errores.push("El costo debe ser un número mayor o igual a cero.");
    }
    if (controlInventario) {
        if (stockTexto.length > 0 && stockTexto[0] == "0" && stockTexto != "0") {
            errores.push("El stock no puede empezar con cero.");
        } else if (isNaN(stock) || stock < 0) {
            errores.push("El stock debe ser un número mayor o igual a cero.");
        }
    }

    if (errores.length > 0) {
        var erroresDiv = document.getElementById("errores-formulario");
        var lista = "";
        for (var e = 0; e < errores.length; e++) lista += "• " + errores[e] + "<br>";
        erroresDiv.innerHTML = lista;
        erroresDiv.classList.remove("oculto");
        return;
    }

    mostrarLoader("Guardando producto...");

    try {
        if (idProductoEditando == null) {
            // CREAR: genero ID y envio a la API
            var productoNuevo = {
                id: generarId("P"),
                nombre: nombre,
                categoria: categoria,
                precio: precio,
                costo: costo,
                controlInventario: controlInventario,
                stock: controlInventario ? stock : null,
                codigo: generarCodigoProducto(),
                imagen: imagen
            };
            await guardarProductoEnAPI(productoNuevo);
            listaProductos.push(productoNuevo);
            mostrarNotificacion("Producto creado correctamente", "exito");
        } else {
            // EDITAR: actualizo localmente y envio a la API
            // Nota: Google Sheets no soporta UPDATE directo, agrego una nueva fila
            // con los datos actualizados. En una app real se usaria un backend real.
            for (var j = 0; j < listaProductos.length; j++) {
                if (listaProductos[j].id == idProductoEditando) {
                    listaProductos[j].nombre = nombre;
                    listaProductos[j].categoria = categoria;
                    listaProductos[j].precio = precio;
                    listaProductos[j].costo = costo;
                    listaProductos[j].controlInventario = controlInventario;
                    listaProductos[j].stock = controlInventario ? stock : null;
                    listaProductos[j].imagen = imagen;
                    await guardarProductoEnAPI(listaProductos[j]);
                    break;
                }
            }
            mostrarNotificacion("Producto actualizado correctamente", "exito");
        }
        cerrarFormularioProducto();
        cargarTablaProductos();
    } catch (error) {
        mostrarNotificacion("Error al guardar: " + error.message, "error");
    } finally {
        ocultarLoader();
    }
}


// ---- ELIMINAR ----

function abrirModalEliminar(idProducto) {
    idProductoAEliminar = idProducto;
    var nombreProducto = "este producto";
    for (var i = 0; i < listaProductos.length; i++) {
        if (listaProductos[i].id == idProducto) {
            nombreProducto = '"' + listaProductos[i].nombre + '"';
            break;
        }
    }
    document.getElementById("mensaje-eliminar").textContent =
        "¿Estás seguro de que quieres eliminar " + nombreProducto + "? Esta acción no se puede deshacer.";
    document.getElementById("modal-eliminar").classList.remove("oculto");
}

function cerrarModalEliminar() {
    document.getElementById("modal-eliminar").classList.add("oculto");
    idProductoAEliminar = null;
}

function ejecutarEliminacion() {
    if (idProductoAEliminar == null) return;
    // Elimino solo localmente (Sheets no tiene DELETE en este backend)
    var filtrados = [];
    for (var i = 0; i < listaProductos.length; i++) {
        if (listaProductos[i].id != idProductoAEliminar) {
            filtrados.push(listaProductos[i]);
        }
    }
    listaProductos = filtrados;
    cerrarModalEliminar();
    cargarTablaProductos();
    mostrarNotificacion("Producto eliminado de la vista");
}


// Muestra una miniatura de la imagen mientras el usuario escribe la URL
function previsualizarImagen() {
    var url = document.getElementById("campo-imagen").value.trim();
    var preview = document.getElementById("preview-imagen");
    if (url == "") {
        preview.innerHTML = "";
        return;
    }
    // Muestra una miniatura de la imagen mientras el usuario escribe la URL
// Muestra una miniatura de la imagen mientras el usuario escribe la URL
function previsualizarImagen() {
    var urlInput = document.getElementById("campo-imagen");
    var preview = document.getElementById("preview-imagen");
    
    if (!urlInput || !preview) return; 

    var url = urlInput.value.trim();

    if (url == "") {
        preview.innerHTML = '<span style="color: #9a9087; font-size: 12px;">Vista previa de imagen</span>';
        return;
    }

    // CORRECCIÓN: Usamos comillas dobles para el style y evitamos el choque en onerror
    preview.innerHTML = '<img src="' + url + '" style="height:80px; border-radius:6px; border:1px solid #e0d8cc; object-fit:cover;" ' +
        'onerror="this.parentElement.innerHTML=\'<span style=\\\'color:#c0392b;font-size:12px\\\'>URL de imagen no válida</span>\'">';
}
