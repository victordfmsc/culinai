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
      gap: 0.75rem;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .chefito-container:hover {
      transform: scale(1.05);
    }

    .chefito-wrapper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .chefito-image {
      width: 48px;
      height: 48px;
      object-fit: contain;
      animation: chef-dance 1.5s ease-in-out infinite;
      flex-shrink: 0;
    }

    @keyframes chef-dance {
      0% {
        transform: translateY(0px) rotate(0deg) scaleX(1);
      }
      15% {
        transform: translateY(-6px) rotate(-3deg) scaleX(0.95);
      }
      30% {
        transform: translateY(0px) rotate(0deg) scaleX(1);
      }
      40% {
        transform: translateY(-4px) rotate(3deg) scaleX(1.05);
      }
      50% {
        transform: translateY(0px) rotate(0deg) scaleX(1);
      }
      60% {
        transform: translateY(-5px) rotate(-2deg) scaleX(0.98);
      }
      75% {
        transform: translateY(0px) rotate(0deg) scaleX(1);
      }
      100% {
        transform: translateY(0px) rotate(0deg) scaleX(1);
      }
    }

    .chefito-text {
      font-size: 1.5rem;
      font-weight: bold;
      color: #000000;
      white-space: nowrap;
      letter-spacing: 0.5px;
    }

    @media (max-width: 600px) {
      .chefito-image {
        width: 36px;
        height: 36px;
      }

      .chefito-text {
        font-size: 1.25rem;
      }

      .chefito-wrapper {
        gap: 0.5rem;
      }
    }
  `]
})
export class ChefitLogoComponent {}
