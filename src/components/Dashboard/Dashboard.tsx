// src/components/Dashboard/Dashboard.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  Megaphone,
  HandHeart,
  Heart,
  Clock,
  Star,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';

export function Dashboard() {
  const { currentUser } = useAuth();
  const { events, announcements, users, donations } = useApp();

  const upcomingEvents = events
    .filter(event => event.date > new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);

  const recentAnnouncements = announcements
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3);

  const stats = {
    totalAlumni: users.filter(u => u.role === 'alumni').length,
    totalStudents: users.filter(u => u.role === 'student').length,
    upcomingEvents: upcomingEvents.length,
    totalDonations: donations.reduce((sum, d) => sum + d.amount, 0),
  };

  const quickActions = [
    { name: 'Browse Alumni', href: '/directory', icon: Users, color: 'bg-blue-500' },
    { name: 'View Events', href: '/events', icon: Calendar, color: 'bg-green-500' },
    { name: 'Read Announcements', href: '/announcements', icon: Megaphone, color: 'bg-purple-500' },
    { name: 'Find Mentors', href: '/mentorship', icon: HandHeart, color: 'bg-orange-500' },
    { name: 'Make Donation', href: '/donate', icon: Heart, color: 'bg-red-500' },
  ];

  // ---------- Notable Alumnus horizontal infinite carousel ----------
  const alumniList = useMemo(() => {
    const list = (users || []).filter(u => u.role === 'alumni').slice(0, 10).map(u => ({
      id: u.id,
      name: u.name,
      employer: u.employer || '—',
      jobTitle: u.jobTitle || '—',
      imageUrl: u.imageUrl || '',
    }));
    // If less than 10, repeat available to reach 10
    if (list.length >= 10) return list;
    const res = [...list];
    let i = 0;
    while (res.length < 10 && list.length > 0) {
      res.push(list[i % list.length]);
      i++;
    }
    return res;
  }, [users]);

  // wrapper refs & animation state
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const firstCopyRef = useRef<HTMLDivElement | null>(null); // measures width of one copy
  const posRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const pointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const startPosRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [copyWidth, setCopyWidth] = useState(0);

  const SPEED_PX_PER_SEC = 25; // adjust speed

  // measure width of one copy (the first copy)
  useEffect(() => {
    const compute = () => {
      const el = firstCopyRef.current;
      if (!el) return setCopyWidth(0);
      setCopyWidth(el.scrollWidth);
    };

    compute();
    let ro: any = null;
    const RO = (window as any).ResizeObserver;
    if (RO && firstCopyRef.current) {
      ro = new RO(compute);
      try { ro.observe(firstCopyRef.current); } catch { /* ignore */ }
    } else {
      window.addEventListener('resize', compute);
    }

    return () => {
      if (ro) try { ro.disconnect(); } catch {}
      else window.removeEventListener('resize', compute);
    };
  }, [alumniList.length]);

  // auto-scroll animation loop (resets by single copy width)
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || copyWidth === 0) return;
    let mounted = true;
    lastTimeRef.current = performance.now();

    const step = (time: number) => {
      if (!mounted) return;
      const dt = (time - (lastTimeRef.current || time)) / 1000;
      lastTimeRef.current = time;

      if (!pointerDownRef.current && copyWidth > 0) {
        posRef.current -= SPEED_PX_PER_SEC * dt;
        // when we've scrolled past one copy, advance by one copy width (seamless loop)
        if (-posRef.current >= copyWidth) posRef.current += copyWidth;
        wrapper.style.transform = `translateX(${posRef.current}px)`;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = null;
    };
  }, [copyWidth]);

  // helper to get clientX for pointer/touch event
  const getClientX = (e: any) => {
    if ('touches' in e && e.touches && e.touches.length) return e.touches[0].clientX;
    if ('clientX' in e) return e.clientX;
    return 0;
  };

  const handlePointerDown = (e: any) => {
    // if pointer event, capture; touch won't have pointerId
    try {
      if ((e as any).pointerId != null && (e.currentTarget as Element).setPointerCapture) {
        (e.currentTarget as Element).setPointerCapture((e as any).pointerId);
      }
    } catch { /* ignore */ }

    pointerDownRef.current = true;
    startXRef.current = getClientX(e);
    startPosRef.current = posRef.current;
    setIsDragging(true);
  };

  const handlePointerMove = (e: any) => {
    if (!pointerDownRef.current) return;
    // prevent default scrolling while dragging horizontally
    if (e.cancelable) e.preventDefault();
    const clientX = getClientX(e);
    const dx = clientX - startXRef.current;
    posRef.current = startPosRef.current + dx;

    if (copyWidth > 0) {
      if (posRef.current > 0) posRef.current -= copyWidth;
      if (-posRef.current >= copyWidth) posRef.current += copyWidth;
    }

    if (wrapperRef.current) wrapperRef.current.style.transform = `translateX(${posRef.current}px)`;
  };

  const handlePointerUp = (e: any) => {
    try {
      if ((e as any).pointerId != null && (e.currentTarget as Element).releasePointerCapture) {
        (e.currentTarget as Element).releasePointerCapture((e as any).pointerId);
      }
    } catch { /* ignore */ }

    pointerDownRef.current = false;                        
    setTimeout(() => setIsDragging(false), 50);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome back, {currentUser?.name}!
        </h1>
        <p className="text-blue-100">
          {currentUser?.role === 'admin'
            ? 'Manage your alumni community and track engagement.'
            : currentUser?.role === 'alumni'
              ? 'Stay connected with your alma mater and help current students.'
              : 'Connect with alumni and explore opportunities for mentorship and career growth.'
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Alumni</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalAlumni}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.upcomingEvents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Current Students</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Heart className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Donations</p>
              <p className="text-2xl font-semibold text-gray-900">₹{stats.totalDonations.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notable Alumnus */}
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notable Alumnus</h2>

          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-lg"
            // attach both pointer and touch events for cross-browser compatibility
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'pan-y', overflowY: 'hidden' }}
          >
            <div
              ref={wrapperRef}
              className="flex items-center gap-4 py-4"
              style={{ transform: `translateX(${posRef.current}px)`, willChange: 'transform' }}
            >
              {/* Render two copies of the alumniList side-by-side.
                  firstCopyRef measures the width of the single copy for reset logic */}
              <div ref={firstCopyRef} className="flex items-center gap-4">
                {alumniList.map((alum, idx) => (
                  <a
                    key={`${alum.id}-a-${idx}`}
                    href="/directory"
                    className="flex flex-col items-center text-center w-40 flex-shrink-0"
                  >
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-white shadow-sm mb-3">
                      <img src={alum.imageUrl?.trim() ? alum.imageUrl : 'https://via.placeholder.com/150'} alt={alum.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 truncate w-full">{alum.name}</div>
                    <div className="text-sm text-gray-500 truncate w-full">{alum.jobTitle}</div>
                    <div className="text-sm text-gray-500 truncate w-full">{alum.employer}</div>
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-4">
                {alumniList.map((alum, idx) => (
                  <a
                    key={`${alum.id}-b-${idx}`}
                    href="/directory"
                    className="flex flex-col items-center text-center w-40 flex-shrink-0"
                  >
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-white shadow-sm mb-3">
                      <img src={alum.imageUrl?.trim() ? alum.imageUrl : 'https://via.placeholder.com/150'} alt={alum.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 truncate w-full">{alum.name}</div>
                    <div className="text-sm text-gray-500 truncate w-full">{alum.jobTitle}</div>
                    <div className="text-sm text-gray-500 truncate w-full">{alum.employer}</div>
                  </a>
                ))}
              </div>
            </div>          
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                to={action.href}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-center group"
              >
                <div className={`${action.color} rounded-full p-3 mx-auto mb-3 w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-900">{action.name}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 text-green-600 mr-2" />
              Upcoming Events
            </h3>
          </div>
          <div className="p-6">
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming events</p>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-500">
                        {format(event.date, 'MMM dd, yyyy • h:mm a')}
                      </p>
                      <p className="text-xs text-gray-500">{event.attendees.length} attending</p>
                    </div>
                  </div>
                ))}
                <Link
                  to="/events"
                  className="block text-center text-blue-600 hover:text-blue-800 text-sm font-medium pt-2"
                >
                  View all events →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Megaphone className="h-5 w-5 text-purple-600 mr-2" />
              Recent Announcements
            </h3>
          </div>
          <div className="p-6">
            {recentAnnouncements.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No announcements</p>
            ) : (
              <div className="space-y-4">
                {recentAnnouncements.map((announcement) => (
                  <div key={announcement.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {announcement.pinned ? (
                        <Star className="h-5 w-5 text-yellow-400" />
                      ) : (
                        <Megaphone className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{announcement.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-2">{announcement.body}</p>
                      <p className="text-xs text-gray-400">
                        {format(announcement.createdAt, 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
                <Link
                  to="/announcements"
                  className="block text-center text-blue-600 hover:text-blue-800 text-sm font-medium pt-2"
                >
                  View all announcements →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import { useApp } from '../../contexts/AppContext';
// import { Link } from 'react-router-dom';
// import {
//   Users,
//   Calendar,
//   Megaphone,
//   HandHeart,
//   Heart,
//   Clock,
//   Star
// } from 'lucide-react';
// import { format } from 'date-fns';

// export function Dashboard() {
//   const { currentUser } = useAuth();
//   const { events, announcements, users, donations } = useApp();

//   const upcomingEvents = events
//     .filter(event => event.date > new Date())
//     .sort((a, b) => a.date.getTime() - b.date.getTime())
//     .slice(0, 3);

//   const recentAnnouncements = announcements
//     .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
//     .slice(0, 3);

//   const stats = {
//     totalAlumni: users.filter(u => u.role === 'alumni').length,
//     totalStudents: users.filter(u => u.role === 'student').length,
//     upcomingEvents: upcomingEvents.length,
//     totalDonations: donations.reduce((sum, d) => sum + d.amount, 0),
//   };

//   const quickActions = [
//     { name: 'Browse Alumni', href: '/directory', icon: Users, color: 'bg-blue-500' },
//     { name: 'View Events', href: '/events', icon: Calendar, color: 'bg-green-500' },
//     { name: 'Read Announcements', href: '/announcements', icon: Megaphone, color: 'bg-purple-500' },
//     { name: 'Find Mentors', href: '/mentorship', icon: HandHeart, color: 'bg-orange-500' },
//     { name: 'Make Donation', href: '/donate', icon: Heart, color: 'bg-red-500' },
//   ];


//   // ---------- Notable Alumnus horizontal infinite carousel ----------
//   const alumniList = useMemo(() => {
//     const list = (users || []).filter(u => u.role === 'alumni').slice(0, 10).map(u => ({
//       id: u.id,
//       name: u.name,
//       employer: u.employer || '—',
//       jobTitle: u.jobTitle || '—',
//       imageUrl: u.imageUrl || '',
//     }));
//     // If less than 10, repeat available to reach 10
//     if (list.length >= 10) return list;
//     const res = [...list];
//     let i = 0;
//     while (res.length < 10 && list.length > 0) {
//       res.push(list[i % list.length]);
//       i++;
//     }
//     return res;
//   }, [users]);

//   const duplicated = useMemo(() => [...alumniList, ...alumniList], [alumniList]);

//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const wrapperRef = useRef<HTMLDivElement | null>(null);
//   const firstCopyRef = useRef<HTMLDivElement | null>(null);
//   const posRef = useRef<number>(0);
//   const rafRef = useRef<number | null>(null);
//   const lastTimeRef = useRef<number | null>(null);
//   const pointerDownRef = useRef(false);
//   const startXRef = useRef(0);
//   const startPosRef = useRef(0);
//   const [isDragging, setIsDragging] = useState(false);
//   const [copyWidth, setCopyWidth] = useState(0);

//   const SPEED_PX_PER_SEC = 15; // adjust speed

//   useEffect(() => {
//     const compute = () => {
//       const el = firstCopyRef.current;
//       if (!el) return setCopyWidth(0);
//       setCopyWidth(el.scrollWidth);
//     };

//     compute();
//     let ro: any = null;
//     const RO = (window as any).ResizeObserver;
//     if (RO && firstCopyRef.current) {
//       ro = new RO(compute);
//       try { ro.observe(firstCopyRef.current); } catch { /* ignore */ }
//     } else {
//       window.addEventListener('resize', compute);
//     }

//     return () => {
//       if (ro) try { ro.disconnect(); } catch { }
//       else window.removeEventListener('resize', compute);
//     };
//   }, [alumniList.length]);

//   useEffect(() => {
//     const wrapper = wrapperRef.current;
//     if (!wrapper) return;
//     let mounted = true;
//     lastTimeRef.current = performance.now();

//     const step = (time: number) => {
//       if (!mounted) return;
//       if (lastTimeRef.current == null) lastTimeRef.current = time;
//       const dt = (time - lastTimeRef.current) / 1000;
//       lastTimeRef.current = time;

//       if (!pointerDownRef.current && copyWidth > 0) {
//         posRef.current -= SPEED_PX_PER_SEC * dt;
//         if (-posRef.current >= copyWidth) posRef.current += copyWidth;
//         wrapper.style.transform = `translateX(${posRef.current}px)`;
//       }

//       rafRef.current = requestAnimationFrame(step);
//     };

//     rafRef.current = requestAnimationFrame(step);
//     return () => {
//       mounted = false;
//       if (rafRef.current) cancelAnimationFrame(rafRef.current);
//       rafRef.current = null;
//       lastTimeRef.current = null;
//     };
//   }, [copyWidth]);

//   const handlePointerDown = (e: React.PointerEvent) => {
//     try { (e.currentTarget as Element).setPointerCapture(e.pointerId); } catch { }
//     pointerDownRef.current = true;
//     startXRef.current = e.clientX;
//     startPosRef.current = posRef.current;
//     setIsDragging(true);
//   };

//   // const handlePointerMove = (e: React.PointerEvent) => {
//   //   if (!pointerDownRef.current) return;
//   //   e.preventDefault();
//   //   let dx = e.clientX - startXRef.current;
//   //   posRef.current = startPosRef.current + dx;
//   //   if (copyWidth > 0) {
//   //     if (posRef.current > 0) posRef.current -= copyWidth;
//   //     if (-posRef.current >= copyWidth) posRef.current += copyWidth;
//   //   }
//   //   if (wrapperRef.current) wrapperRef.current.style.transform = `translateX(${posRef.current}px)`;
//   // };
//   const handlePointerMove = (e: React.PointerEvent | React.TouchEvent) => {
//     if (!pointerDownRef.current) return;
//     e.preventDefault();
//     let clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
//     let dx = clientX - startXRef.current;
//     posRef.current = startPosRef.current + dx;
//     if (copyWidth > 0) {
//       if (posRef.current > 0) posRef.current -= copyWidth;
//       if (-posRef.current >= copyWidth) posRef.current += copyWidth;
//     }
//     if (wrapperRef.current) wrapperRef.current.style.transform = `translateX(${posRef.current}px)`;
//   };


//   const handlePointerUp = (e: React.PointerEvent) => {
//     try { (e.currentTarget as Element).releasePointerCapture(e.pointerId); } catch { }
//     pointerDownRef.current = false;
//     setTimeout(() => setIsDragging(false), 50);
//   };




//   return (
//     <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
//       {/* Welcome Section */}
//       <div className="bg-gradient-to-r from-blue-600 to-blue-900 rounded-lg shadow-lg p-6 mb-8">
//         <h1 className="text-2xl font-bold text-white mb-2">
//           Welcome back, {currentUser?.name}!
//         </h1>
//         <p className="text-blue-100">
//           {currentUser?.role === 'admin'
//             ? 'Manage your alumni community and track engagement.'
//             : currentUser?.role === 'alumni'
//               ? 'Stay connected with your alma mater and help current students.'
//               : 'Connect with alumni and explore opportunities for mentorship and career growth.'
//           }
//         </p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center">
//             <div className="flex-shrink-0">
//               <Users className="h-8 w-8 text-blue-600" />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-500">Total Alumni</p>
//               <p className="text-2xl font-semibold text-gray-900">{stats.totalAlumni}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center">
//             <div className="flex-shrink-0">
//               <Calendar className="h-8 w-8 text-green-600" />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
//               <p className="text-2xl font-semibold text-gray-900">{stats.upcomingEvents}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center">
//             <div className="flex-shrink-0">
//               <Users className="h-8 w-8 text-purple-600" />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-500">Current Students</p>
//               <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center">
//             <div className="flex-shrink-0">
//               <Heart className="h-8 w-8 text-red-600" />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-500">Total Donations</p>
//               <p className="text-2xl font-semibold text-gray-900">₹{stats.totalDonations.toLocaleString()}</p>
//             </div>
//           </div>
//         </div>
//       </div>



//       {/* Notable Alumnus */}
//       <div className="mb-8">

//         <div className="mb-6">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Notable Alumnus</h2>
//           {/* <div
//             className="relative overflow-hidden rounded-lg"
//             ref={containerRef}
//             onPointerDown={handlePointerDown}
//             onPointerMove={handlePointerMove}
//             onPointerUp={handlePointerUp}
//             onPointerCancel={handlePointerUp}
//             style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
//           > */}
//           <div
//             ref={containerRef}
//             className="relative overflow-hidden rounded-lg"
//             onPointerDown={handlePointerDown}
//             onPointerMove={handlePointerMove}
//             onPointerUp={handlePointerUp}
//             onPointerCancel={handlePointerUp}
//             onTouchStart={handlePointerDown}
//             onTouchMove={handlePointerMove}
//             onTouchEnd={handlePointerUp}
//             style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'pan-y' }} // important
//           >

//             <div
//               ref={wrapperRef}
//               className="flex items-center gap-4 py-4"
//               style={{ transform: `translateX(${posRef.current}px)`, willChange: 'transform' }}
//             >
//               <div ref={firstCopyRef} className="flex items-center gap-4">
//                 {duplicated.map((alum, idx) => (
//                   <a
//                     key={`${alum.id}-${idx}`}
//                     href="/directory"
//                     className="flex flex-col items-center text-center w-40 flex-shrink-0"
//                   >
//                     <div className="w-24 h-24 rounded-full overflow-hidden bg-white shadow-sm mb-3">
//                       <img src={alum.imageUrl?.trim() ? alum.imageUrl : 'https://via.placeholder.com/150'} alt={alum.name} className="w-full h-full object-cover" />
//                     </div>
//                     <div className="text-s font-medium text-gray-900 truncate w-full">{alum.name}</div>
//                     <div className="text-sm text-gray-500 truncate w-full">{alum.jobTitle}</div>
//                     <div className="text-sm text-gray-500 truncate w-full">{alum.employer}</div>
//                   </a>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>


//         {/* Quick Actions */}
//         <div>
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
//         </div>

//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
//           {quickActions.map((action) => {
//             const Icon = action.icon;
//             return (
//               <Link
//                 key={action.name}
//                 to={action.href}
//                 className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-center group"
//               >
//                 <div className={`${action.color} rounded-full p-3 mx-auto mb-3 w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform`}>
//                   <Icon className="h-6 w-6 text-white" />
//                 </div>
//                 <p className="text-sm font-medium text-gray-900">{action.name}</p>
//               </Link>
//             );
//           })}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* Upcoming Events */}
//         <div className="bg-white rounded-lg shadow">
//           <div className="px-6 py-4 border-b border-gray-200">
//             <h3 className="text-lg font-semibold text-gray-900 flex items-center">
//               <Calendar className="h-5 w-5 text-green-600 mr-2" />
//               Upcoming Events
//             </h3>
//           </div>
//           <div className="p-6">
//             {upcomingEvents.length === 0 ? (
//               <p className="text-gray-500 text-center py-4">No upcoming events</p>
//             ) : (
//               <div className="space-y-4">
//                 {upcomingEvents.map((event) => (
//                   <div key={event.id} className="flex items-start space-x-3">
//                     <div className="flex-shrink-0">
//                       <Clock className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-medium text-gray-900">{event.title}</p>
//                       <p className="text-sm text-gray-500">
//                         {format(event.date, 'MMM dd, yyyy • h:mm a')}
//                       </p>
//                       <p className="text-xs text-gray-500">{event.attendees.length} attending</p>
//                     </div>
//                   </div>
//                 ))}
//                 <Link
//                   to="/events"
//                   className="block text-center text-blue-600 hover:text-blue-800 text-sm font-medium pt-2"
//                 >
//                   View all events →
//                 </Link>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Recent Announcements */}
//         <div className="bg-white rounded-lg shadow">
//           <div className="px-6 py-4 border-b border-gray-200">
//             <h3 className="text-lg font-semibold text-gray-900 flex items-center">
//               <Megaphone className="h-5 w-5 text-purple-600 mr-2" />
//               Recent Announcements
//             </h3>
//           </div>
//           <div className="p-6">
//             {recentAnnouncements.length === 0 ? (
//               <p className="text-gray-500 text-center py-4">No announcements</p>
//             ) : (
//               <div className="space-y-4">
//                 {recentAnnouncements.map((announcement) => (
//                   <div key={announcement.id} className="flex items-start space-x-3">
//                     <div className="flex-shrink-0">
//                       {announcement.pinned ? (
//                         <Star className="h-5 w-5 text-yellow-400" />
//                       ) : (
//                         <Megaphone className="h-5 w-5 text-gray-400" />
//                       )}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-medium text-gray-900">{announcement.title}</p>
//                       <p className="text-sm text-gray-500 line-clamp-2">{announcement.body}</p>
//                       <p className="text-xs text-gray-400">
//                         {format(announcement.createdAt, 'MMM dd, yyyy')}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//                 <Link
//                   to="/announcements"
//                   className="block text-center text-blue-600 hover:text-blue-800 text-sm font-medium pt-2"
//                 >
//                   View all announcements →
//                 </Link>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
