import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from './ui/sidebar';
import {
  GraduationCap,
  Home,
  BookOpen,
  Users,
  Calendar,
  Settings,
  LogOut,
  User,
  FileText,
  Clock,
  Building
} from 'lucide-react';

const menuItems = {
  administrator: [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: BookOpen, label: 'Cursos', href: '/courses' },
    { icon: Users, label: 'Usuários', href: '/users' },
    { icon: Building, label: 'Salas', href: '/rooms' },
    { icon: Calendar, label: 'Distribuições', href: '/distributions' },
    { icon: FileText, label: 'Relatórios', href: '/reports' },
    { icon: Settings, label: 'Configurações', href: '/settings' },
  ],
  coordinator: [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: BookOpen, label: 'Meus Cursos', href: '/courses' },
    { icon: Users, label: 'Turmas', href: '/student-groups' },
    { icon: FileText, label: 'Disciplinas', href: '/subjects' },
    { icon: Calendar, label: 'Distribuição de Aulas', href: '/activities' },
    { icon: Clock, label: 'Restrições de Professores', href: '/teacher-restrictions' },
    { icon: FileText, label: 'Relatórios', href: '/reports' },
  ],
  teacher: [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Calendar, label: 'Minhas Aulas', href: '/my-activities' },
    { icon: Clock, label: 'Restrições de Horário', href: '/my-restrictions' },
    { icon: User, label: 'Meu Perfil', href: '/profile' },
  ]
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const userMenuItems = menuItems[user?.role] || menuItems.teacher;

  const handleLogout = async () => {
    await logout();
  };

  const getUserInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const getRoleLabel = (role) => {
    const roles = {
      administrator: 'Administrador',
      coordinator: 'Coordenador',
      teacher: 'Professor'
    };
    return roles[role] || 'Usuário';
  };

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="p-2 bg-primary rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Sistema de Horários</span>
                <span className="text-xs text-muted-foreground">Gestão Acadêmica</span>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              {userMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <a href={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter>
            <div className="p-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-2 h-auto p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getUserInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-medium">{user?.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {getRoleLabel(user?.role)}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 flex flex-col">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-4">
              <SidebarTrigger />
              <div className="flex-1" />
            </div>
          </header>
          
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

