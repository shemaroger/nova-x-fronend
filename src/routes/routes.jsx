import Signup from '../pages/Autho/Signup';
import Login from '../pages/Autho/Login';
import Mainpage from '../pages/components/mainpage';
import ViewInvesterUser from '../pages/User/ViewInvesterUser';
import ViewSMEUser from '../pages/User/ViewSMEUser';
import AddKyc from '../pages/KYC/AddKyc';
import KYCDocumentsPage from '../pages/KYC/KYCDocuments';
import AddAnalysis from '../pages/Analysis/AddAnalysis';
import GetSMEUsers from '../pages/Invester/getSMEUsers';
import SubscriptionPlan from '../pages/Subscription/SubscriptionPlan';
import Subscription from '../pages/Subscription/Subscription';
import PaymentsManagement from '../pages/Payment/PaymentsManagement';
import AdminDashboard from '../pages/components/AdminDashboard';

export const routes = [
    { path: '/signup', component: Signup, name: 'Signup' },
    { path: '/', component: Login, name: 'Login' },
    { path: '/login', component: Login, name: 'Login' },
    { path: '/addkyc', component: AddKyc, name: 'AddKyc' },
    {
        path: '/dashboard',
        component: Mainpage,
        name: 'Mainpage',
        children: [
            { path: 'viewuinvesteruser', component: ViewInvesterUser, name: 'viewuinvesteruser' },
            { path: 'viewsmeuser', component: ViewSMEUser, name: 'viewsmeuser' },
            { path: 'viewusers', component: ViewSMEUser, name: 'viewsmeuser' },
            { path: 'kycdocuments/:userId', component: KYCDocumentsPage, name: 'kycdocuments' },
            { path: 'addanalysis', component: AddAnalysis, name: 'addanalysis' },
            { path: 'get-sme-users', component: GetSMEUsers, name: 'get-sme-users' },
            { path: 'subscription-plan', component: SubscriptionPlan, name: 'subscription-plan' },
            { path: 'subscription', component: Subscription, name: 'subscription' },
            { path: 'payments-management', component: PaymentsManagement, name: 'payments-management' },
            { path: 'admin-dashboard', component: AdminDashboard, name: 'admin-dashboard' },






        ]
    },


]