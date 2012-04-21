
$(document).ready(function(){
	$('[contenteditable]').live('focus', function() {
		var $this = $(this);
		$this.data('before', $this.html());
		return $this;
	}).live('blur keyup paste', function() {
		var $this = $(this);
		if ($this.data('before') !== $this.html()) {
			$this.data('before', $this.html());
			$this.trigger('change');
		}
		return $this;
	});
	
});
