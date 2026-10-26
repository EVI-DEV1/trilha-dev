import { Routes } from '@angular/router';
import { authGuard, boasVindasGuard, visitanteGuard } from './core/guards/auth.guard';

// Cada página é carregada sob demanda (lazy loading) com loadComponent
export const routes: Routes = [
  { path: 'boas-vindas', title: 'Bem-vindo · Trilha', loadComponent: () => import('./features/boas-vindas/boas-vindas.component').then((m) => m.BoasVindasComponent) },
  { path: 'entrar', title: 'Entrar · Trilha', canActivate: [boasVindasGuard, visitanteGuard], loadComponent: () => import('./features/entrar/entrar.component').then((m) => m.EntrarComponent) },
  { path: 'baixar', title: 'Baixar o app · Trilha', loadComponent: () => import('./features/baixar/baixar.component').then((m) => m.BaixarComponent) },
  { path: 'redefinir-senha', title: 'Nova senha · Trilha', loadComponent: () => import('./features/redefinir-senha/redefinir-senha.component').then((m) => m.RedefinirSenhaComponent) },
  {
    path: '',
    canActivateChild: [boasVindasGuard, authGuard],
    children: [
      { path: '', title: 'Painel · Trilha', loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'trilhas', title: 'Trilhas · Trilha', loadComponent: () => import('./features/trilhas/trilhas.component').then((m) => m.TrilhasComponent) },
      { path: 'trilhas/:id', title: 'Trilha · Trilha', loadComponent: () => import('./features/trilhas/trilha-detalhe.component').then((m) => m.TrilhaDetalheComponent) },
      { path: 'foco', title: 'Foco · Trilha', loadComponent: () => import('./features/foco/foco.component').then((m) => m.FocoComponent) },
      { path: 'github', title: 'Portfólio · Trilha', loadComponent: () => import('./features/github/github.component').then((m) => m.GithubComponent) },
      { path: 'conta', title: 'Conta · Trilha', loadComponent: () => import('./features/conta/conta.component').then((m) => m.ContaComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
