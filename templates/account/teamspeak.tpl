<!-- IF showSetup -->
<div class="panel panel-default">
    <div class="panel-heading">
        <h3 class="panel-title">TeamSpeak Verify Anleitung</h3>
    </div>
    <div class="panel-body">
        <p>
            {text}
        </p>
    </div>
</div>
<!-- ENDIF showSetup -->
<div class="panel panel-default">
    <div class="panel-heading">
        <!-- IF showSetup -->
        <span class="text-danger pull-right"><strong>Nicht Verifiziert</strong> <i class="fa fa-circle"></i></span><br/>
        <!-- ELSE -->
        <span class="text-success pull-right"><strong>Verifiziert</strong> <i class="fa fa-circle"></i></span><br/>
        <!-- ENDIF showSetup -->
        <h3 class="panel-title">TeamSpeak Verify</h3>
    </div>
    <div class="panel-body">
        <!-- IF showSetup -->
        <div class="alert ui-draggable-handle alert-danger" id="notFound"></div>
        <label for="tsid">TeamSpeak UID:</label>
        <input type="text" class="form-control" id="tsid"/><br/>
        <button class="btn btn-primary" data-action="verify">Verzifizieren</button>

        <div id="codeCheck" class="modal fade" role="dialog">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">Verifizierung</h4>
                    </div>
                    <div class="modal-body">
                        <label for="randomcode">Code:</label>
                        <input type="text" class="form-control" id="randomcode"/><br/>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" data-action="checkNow">Verifizieren</button>
                    </div>
                </div>
            </div>
            <!-- ELSE -->
            Aktuell assoziiert mit: <i>{tsid}</i><br/>
            <button class="btn btn-primary" data-action="reverify">Verifizierung zurück ziehen</button>
            <!-- ENDIF showSetup -->
            <input type="hidden" class="form-control" id="uid" value="{uid}"/><br/>
        </div>
    </div>
</div>