import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3200,
  timerProgressBar: true,
  customClass: {
    popup: 'stocknext-toast',
  },
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

export function notifySuccess(title: string, text?: string): void {
  void Toast.fire({
    icon: 'success',
    iconColor: '#059669',
    title,
    text,
  });
}

export async function confirmAction(
  title: string,
  text: string,
  confirmButtonText: string,
): Promise<boolean> {
  const result = await Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#4f46e5',
    cancelButtonColor: '#71717a',
    reverseButtons: true,
    focusCancel: true,
  });

  return result.isConfirmed;
}
