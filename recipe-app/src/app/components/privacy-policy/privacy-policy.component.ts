import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <button 
        (click)="goBack.emit()" 
        class="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Volver
      </button>

      <h1 class="text-3xl font-bold text-gray-800 mb-6">Política de Privacidad</h1>
      
      <div class="prose prose-lg max-w-none space-y-6 text-gray-700">
        <p class="text-base leading-relaxed">
          En Kineti Apps, respetamos y protegemos tu privacidad. Esta Política de Privacidad describe cómo recopilamos y utilizamos los datos personales de los usuarios de nuestra aplicación de recetas.
        </p>

        <div>
          <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">Responsable del tratamiento</h2>
          <p class="text-base leading-relaxed">
            La aplicación pertenece a Kineti Apps. Puedes contactarnos en: <a href="mailto:victordfmsc@gmail.com" class="text-indigo-600 hover:text-indigo-800 underline">victordfmsc&#64;gmail.com</a>.
          </p>
        </div>

        <div>
          <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">Datos que recogemos</h2>
          <p class="text-base leading-relaxed">
            Para utilizar la app, solo necesitas hacer login. Recogemos únicamente los datos necesarios para el acceso y la gestión de tu suscripción (0,99€ mensual o 3,99€ anual).
          </p>
        </div>

        <div>
          <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">Uso de los datos</h2>
          <p class="text-base leading-relaxed">
            Tus datos se usan exclusivamente para ofrecerte el servicio de recetas, planificaciones semanales, lista de la compra y administración de la suscripción.
          </p>
        </div>

        <div>
          <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">No compartimos datos</h2>
          <p class="text-base leading-relaxed">
            No compartimos, vendemos ni cedemos tus datos personales a terceros bajo ninguna circunstancia.
          </p>
        </div>

        <div>
          <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">Seguridad de los datos</h2>
          <p class="text-base leading-relaxed">
            Adoptamos medidas técnicas y organizativas para proteger tus datos frente a accesos no autorizados, pérdida o alteración.
          </p>
        </div>

        <div>
          <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">Derechos del usuario</h2>
          <p class="text-base leading-relaxed">
            Puedes acceder, rectificar o eliminar tus datos en cualquier momento contactándonos en <a href="mailto:victordfmsc@gmail.com" class="text-indigo-600 hover:text-indigo-800 underline">victordfmsc&#64;gmail.com</a>.
          </p>
        </div>

        <div>
          <h2 class="text-2xl font-semibold text-gray-800 mt-8 mb-4">Cambios en la política</h2>
          <p class="text-base leading-relaxed">
            Podemos actualizar esta política para cumplir con modificaciones legales o mejorar el servicio. Te informaremos oportunamente.
          </p>
        </div>
      </div>
    </div>
  `
})
export class PrivacyPolicyComponent {
  @Output() goBack = new EventEmitter<void>();
}
