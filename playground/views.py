from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response

from accounts.models import Utilisateur

from .linux_shell import run_command
from .sql_sandbox import ensure_sandbox, execute_sql
from .subnet_calc import calculate_subnet


@api_view(["POST"])
def linux_run(request):
    data = request.data
    utilisateur_id = data.get("utilisateur")
    command = data.get("command") or ""
    cwd = data.get("cwd") or "/home/user"

    if not utilisateur_id:
        return Response({"error": "utilisateur est requis."}, status=400)

    utilisateur = get_object_or_404(Utilisateur, id=utilisateur_id)
    result = run_command(command, utilisateur, cwd)
    return Response(result)


@api_view(["POST"])
def sql_execute(request):
    data = request.data
    utilisateur_id = data.get("utilisateur")
    sql = data.get("sql") or ""

    if not utilisateur_id or not sql.strip():
        return Response({"error": "utilisateur et sql sont requis."}, status=400)

    try:
        result = execute_sql(utilisateur_id, sql)
    except Exception as exc:
        return Response({"error": str(exc)}, status=400)

    return Response(result)


@api_view(["POST"])
def sql_reset(request):
    utilisateur_id = request.data.get("utilisateur")
    if not utilisateur_id:
        return Response({"error": "utilisateur est requis."}, status=400)

    ensure_sandbox(utilisateur_id, reset=True)
    return Response({"status": "ok"})


@api_view(["POST"])
def subnet_calculate(request):
    cidr = request.data.get("cidr") or ""
    if not cidr.strip():
        return Response({"error": "Le champ 'cidr' est requis (ex: 192.168.1.10/26)."}, status=400)

    try:
        result = calculate_subnet(cidr)
    except ValueError as exc:
        return Response({"error": str(exc)}, status=400)

    return Response(result)
