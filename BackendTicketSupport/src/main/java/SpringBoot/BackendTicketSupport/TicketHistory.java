package SpringBoot.BackendTicketSupport;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "ticket_status_history")
public class TicketHistory {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "\"ticketId\"")
	private Long ticketId;
	private String old_status;
	private String new_status;
	private String notes;
	@Column(name = "\"changedById\"")
	private Long changedById;
	private LocalDateTime changed_at;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getTicketId() {
		return ticketId;
	}

	public void setTicketId(Long ticketId) {
		this.ticketId = ticketId;
	}

	public String getOld_status() {
		return old_status;
	}

	public void setOld_status(String old_status) {
		this.old_status = old_status;
	}

	public String getNew_status() {
		return new_status;
	}

	public void setNew_status(String new_status) {
		this.new_status = new_status;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}

	public Long getChangedById() {
		return changedById;
	}

	public void setChangedById(Long changedById) {
		this.changedById = changedById;
	}

	public LocalDateTime getChanged_at() {
		return changed_at;
	}

	public void setChanged_at(LocalDateTime changed_at) {
		this.changed_at = changed_at;
	}

}
