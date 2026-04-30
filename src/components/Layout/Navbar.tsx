// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
// import { ProfileDropdown } from './ProfileDropdown';
// import { 
//   Home, 
//   Users, 
//   Calendar, 
//   Megaphone, 
//   HandHeart, 
//   Heart, 
//   Settings, 
//   GraduationCap
// } from 'lucide-react';

// export function Navbar() {
//   const { currentUser } = useAuth();
//   const location = useLocation();

//   if (!currentUser) return null;

//   const navigation = [
//     { name: 'Dashboard', href: '/dashboard', icon: Home },
//     { name: 'Directory', href: '/directory', icon: Users },
//     { name: 'Events', href: '/events', icon: Calendar },
//     { name: 'Announcements', href: '/announcements', icon: Megaphone },
//     { name: 'Mentorship', href: '/mentorship', icon: HandHeart },
//     { name: 'Donate', href: '/donate', icon: Heart },
//   ];

//   const adminNavigation = [
//     ...navigation,
//     { name: 'Admin', href: '/admin', icon: Settings },
//   ];

//   const navItems = currentUser.role === 'admin' ? adminNavigation : navigation;

//   return (
//     <nav className="bg-white border-b border-gray-200">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           <div className="flex items-center">
//             <Link to="/dashboard" className="flex items-center space-x-2">
//               <GraduationCap className="h-8 w-8 text-blue-600" />
//               <span className="text-xl font-bold text-gray-900">Alumni Connect</span>
//             </Link>
//           </div>

//           <div className="hidden md:block">
//             <div className="ml-10 flex items-baseline space-x-4">
//               {navItems.map((item) => {
//                 const Icon = item.icon;
//                 const isActive = location.pathname === item.href;
//                 return (
//                   <Link
//                     key={item.name}
//                     to={item.href}
//                     className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
//                       isActive
//                         ? 'bg-blue-100 text-blue-700'
//                         : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
//                     }`}
//                   >
//                     <Icon className="h-4 w-4" />
//                     <span>{item.name}</span>
//                   </Link>
//                 );
//               })}
//             </div>
//           </div>

//           <div className="flex items-center space-x-4">
//             <ProfileDropdown />
//           </div>
//         </div>
//       </div>

//       {/* Mobile menu */}
//       <div className="md:hidden">
//         <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
//           {navItems.map((item) => {
//             const Icon = item.icon;
//             const isActive = location.pathname === item.href;
//             return (
//               <Link
//                 key={item.name}
//                 to={item.href}
//                 className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
//                   isActive
//                     ? 'bg-blue-100 text-blue-700'
//                     : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
//                 }`}
//               >
//                 <Icon className="h-5 w-5" />
//                 <span>{item.name}</span>
//               </Link>
//             );
//           })}
//         </div>
//       </div>
//     </nav>
//   );
// }

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileDropdown } from './ProfileDropdown';
import { 
  Home, 
  Users, 
  Calendar, 
  Megaphone, 
  HandHeart, 
  Heart, 
  Settings, 
  GraduationCap, 
  Menu, 
  Briefcase,
  X 
} from 'lucide-react';

export function Navbar() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser) return null;

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Directory', href: '/directory', icon: Users },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Announcements', href: '/announcements', icon: Megaphone },
    { name: 'Mentorship', href: '/mentorship', icon: HandHeart },
    { name: 'Donate', href: '/donate', icon: Heart },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
  ];

  const adminNavigation = [
    ...navigation,
    { name: 'Admin', href: '/admin', icon: Settings },
  ];

  const navItems = currentUser.role === 'admin' ? adminNavigation : navigation;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">AlumniConnect</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            <ProfileDropdown />

            {/* Mobile hamburger button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none"
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-600 ${
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setMobileOpen(false)} // close menu on click
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
