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
import SMEProfile from '../pages/User/SMEProfilePage';
import InvestorProfile from '../pages/Invester/InvestorProfilePage';
import UserLogs from '../pages/User/Userlogs';
import InvestorDashboard from '../pages/Invester/InvestorDashboard';
import SMEDashboard from '../pages/User/SMEDashboard';
import NotificationsManagementPage from '../pages/Notification/NotificationsManagement';
import Investment from '../pages/Invester/investiment';
import ChatInterface from '../pages/Chat/ChatInterface';
import SMEChatManagement from '../pages/Chat/SMEChatManagement';
import AnalysisListing from '../pages/Analysis/AnalysisListing';
import UserRegistrationReportPage from '../pages/Report/UserRegistrationReportPage';
import PaymentsReportPage from '../pages/Report/PaymentsReportPage';
import Landingpage from '../pages/Landingpage';

export const routes = [
    { path: '/signup', component: Signup, name: 'Signup' },
    { path: '/', component: Landingpage, name: 'landignpage' },
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
            { path: 'sme-profile', component: SMEProfile, name: 'sme-profile' },
            { path: 'investor-profile', component: InvestorProfile, name: 'investor-profile' },
            { path: 'user-logs', component: UserLogs, name: 'user-logs' },
            { path: 'investor-dashboard', component: InvestorDashboard, name: 'investor-dashboard' },
            { path: 'sme-dashboard', component: SMEDashboard, name: 'sme-dashboard' },
            { path: 'notifications-management', component: NotificationsManagementPage, name: 'notifications-management' },
            { path: 'investment', component: Investment, name: 'investment' },
            { path: 'chat-interface', component: ChatInterface, name: 'chat-interface' },
            { path: 'chat', component: ChatInterface, name: 'chat' },
            { path: 'sme-chat-management', component: SMEChatManagement, name: 'sme-chat-management' },
            { path: 'analysis-listing', component: AnalysisListing, name: 'analysis-listing' },
            { path: 'user-registration-report', component: UserRegistrationReportPage, name: 'user-registration-report' },
            { path: 'payments-report', component: PaymentsReportPage, name: 'payments-report' },


        ]
    },


]