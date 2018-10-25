import "./ticketSrv";
import "./ticketsSrv";
//import "./ticketCreateModule";
//import "./ticketListModule";
import "./ticketApplyModule";
import "./applyModule";
import  "./pendingTicket";
import  "./myApplyModule";
import  "./allTicketsModule";
import  "./ticketReportsModule";
angular.module("ticketModule",[
	"ticketSrv",
	//"ticketCreateModule",
	//"ticketListModule",
	"ticketApplyModule",
	"pendingTicketModule",
	"ticketsApplyModule",
	"ticketsSrv",
	"myApplyModule",
	"allTicketsModule",
	"ticketReportsModule",
	]);
