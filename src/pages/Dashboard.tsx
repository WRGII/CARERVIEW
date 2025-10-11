@@ .. @@
 import React from 'react';
 import { Link } from 'react-router-dom';
 import { useQuery } from '@tanstack/react-query';
 import { supabase } from '../lib/supabase';
 import { useAuth } from '../contexts/AuthContext';
 import { Header } from '../components/Header';
 import { ObservationCard } from '../components/ObservationCard';
-import { Plus, FileText, TrendingUp } from 'lucide-react';
+import { Plus, FileText, TrendingUp, CreditCard } from 'lucide-react';
 
@@ .. @@
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
             <Link
               to="/new-observation"
               className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-dashed border-gray-300 hover:border-blue-400 flex flex-col items-center justify-center text-center min-h-[200px]"
             >
               <Plus className="w-12 h-12 text-blue-600 mb-4" />
               <h3 className="text-lg font-semibold text-gray-900 mb-2">New Observation</h3>
               <p className="text-gray-600">Start a new caregiving observation session</p>
             </Link>
+            
+            <Link
+              to="/choose-plan"
+              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-400 flex flex-col items-center justify-center text-center min-h-[200px]"
+            >
+              <CreditCard className="w-12 h-12 text-green-600 mb-4" />
+              <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Subscription</h3>
+              <p className="text-gray-600">View or change your subscription plan</p>
+            </Link>
 
             <Link
               to="/sample-report"
               className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-400 flex flex-col items-center justify-center text-center min-h-[200px]"
             >
               <FileText className="w-12 h-12 text-purple-600 mb-4" />
               <h3 className="text-lg font-semibold text-gray-900 mb-2">Sample Report</h3>
               <p className="text-gray-600">View a sample observation report</p>
             </Link>
           </div>