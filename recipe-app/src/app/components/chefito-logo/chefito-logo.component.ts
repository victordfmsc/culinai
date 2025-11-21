import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chefito-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chefito-container">
      <div class="chefito-wrapper">
        <img 
          src="assets/chefito-logo.png" 
          alt="Chefito Chef" 
          class="chefito-image"
        />
        <div class="chefito-text">Chefito</div>
      </div>
    </div>
  `,
  styles: [`
    .chefito-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .chefito-container:hover {
      transform: scale(1.05);
    }

    .chefito-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .chefito-image {
      width: 40px;
      height: 40px;
      object-fit: contain;
      animation: cooking-motion 2s ease-in-out infinite;
    }

    @keyframes cooking-motion {
      0% {
        transform: translateY(0px) rotate(0deg);
      }
      25% {
        transform: translateY(-3px) rotate(-2deg);
      }
      50% {
        transform: translateY(0px) rotate(0deg);
      }
      75% {
        transform: translateY(-3px) rotate(2deg);
      }
      100% {
        transform: translateY(0px) rotate(0deg);
      }
    }

    .chefito-text {
      font-size: 1.5rem;
      font-weight: bold;
      color: #ff6b35;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
      letter-spacing: 1px;
      white-space: nowrap;
      animation: text-pop 2s ease-in-out infinite;
    }

    @keyframes text-pop {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }

    @media (max-width: 600px) {
      .chefito-image {
        width: 32px;
        height: 32px;
      }

      .chefito-text {
        font-size: 1.25rem;
      }
    }
  `]
})
export class ChefitLogoComponent {}
