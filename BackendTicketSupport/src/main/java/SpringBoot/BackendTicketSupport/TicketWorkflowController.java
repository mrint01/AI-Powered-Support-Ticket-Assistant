package SpringBoot.BackendTicketSupport;

import java.awt.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/tickets")
public class TicketWorkflowController {

	@Autowired
	private TicketWorkflowService workflowService;

	@GetMapping("/list")
	public ResponseEntity<java.util.List<Ticket>> getAllTickets() {
		java.util.List<Ticket> tickets = workflowService.getAllTickets();
		return ResponseEntity.ok(tickets);
	}

	@PostMapping("/{id}/start")
	public ResponseEntity<String> handleTicketEvent(@PathVariable Long id) {
		workflowService.startWorkflow(id);
		return ResponseEntity.ok("Workflow started");
	}
}
