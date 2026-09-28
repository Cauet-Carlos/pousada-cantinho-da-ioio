document.addEventListener('DOMContentLoaded', function () {
  var form = document.querySelector('.widget');
  if (!form) return;

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();

    var checkin = document.getElementById('widget-checkin').value;
    var checkout = document.getElementById('widget-checkout').value;
    var hospedes = document.getElementById('widget-hospedes').value;

    var params = new URLSearchParams();
    if (checkin) params.set('checkin', checkin);
    if (checkout) params.set('checkout', checkout);
    if (hospedes) params.set('hospedes', hospedes);

    window.location.href = 'reserva.html' + (params.toString() ? '?' + params.toString() : '');
  });
});