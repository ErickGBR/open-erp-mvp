import Swal from 'sweetalert2';

/**
 * Show a dark-themed SweetAlert2 confirmation dialog before deleting an entity.
 *
 * @param title — Short description of what is being deleted (e.g. the product name).
 * @returns `true` when the user clicks "Sí, eliminar", `false` otherwise.
 */
export async function confirmDelete(title: string): Promise<boolean> {
  const result = await Swal.fire({
    title: '¿Eliminar?',
    text: title,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    background: '#1a1a2e',
    color: '#e2e8f0',
  });
  return result.isConfirmed;
}
