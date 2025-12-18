package SpringBoot.BackendTicketSupport;

import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 
 */
@Service
public class TicketWorkflowService {

	private static final Logger Log = LoggerFactory.getLogger(TicketWorkflowService.class);

	private static final Long SYSTEM_USER_ID = 1L;
	private static final String SYSTEM_NOTE = "Automatic workflow update by system";

	@Autowired
	private TicketRepository ticketRepository;

	@Autowired
	private TicketHistoryRepository historyRepository;

	/**
	 * @return
	 */
	public java.util.List<Ticket> getAllTickets() {
		return ticketRepository.findAll();
	}

	/**
	 * @param id
	 */
	public void startWorkflow(Long id) {
		// Run async to not block the HTTP request
		CompletableFuture.runAsync(() -> {
			processTicket(id);
		});
	}

	/**
	 * @param ticketId
	 */
	private void processTicket(Long ticketId) {
		try {
			// Simulate queue -> In Progress (after 5 sec)
			Thread.sleep(5000);
			Log.info("SYSTEM_USER_ID "+SYSTEM_USER_ID);
			Log.info("update status after 5s");
			updateStatus(ticketId, "in progress");

			// Simulate processing -> Resolved (after 12 sec)
			Thread.sleep(12000);
			Log.info("update status after 12s");
			updateStatus(ticketId, "resolved");

		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * @param ticketId
	 * @param newStatus
	 */
	private void updateStatus(Long ticketId, String newStatus) {
		Ticket ticket = ticketRepository.findById(ticketId).orElse(null);
		if (ticket == null)
			return;

		String oldStatus = ticket.getStatus();
		ticket.setStatus(newStatus);
		ticketRepository.save(ticket);

		TicketHistory history = new TicketHistory();
		history.setTicketId(ticketId);
		history.setOld_status(oldStatus);
		history.setNew_status(newStatus);
		history.setChanged_at(LocalDateTime.now());
		history.setNotes(SYSTEM_NOTE);
		history.setChangedById(SYSTEM_USER_ID);
		historyRepository.save(history);
	}

}
