@@ .. @@
 import React from 'react';
 import { Link, useNavigate } from 'react-router-dom';
 import { useAuth } from '../contexts/AuthContext';
+import { SubscriptionStatus } from './SubscriptionStatus';
 import { LogOut, User, FileText, Plus } from 'lucide-react';
 
@@ .. @@
         <div className="flex items-center space-x-4">
           {user && (
             <>
+              <SubscriptionStatus />
               <Link
                 to="/new-observation"
                 className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
           )
           }