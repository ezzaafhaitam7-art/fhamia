import ipaddress


def calculate_subnet(cidr):
    try:
        interface = ipaddress.ip_interface(cidr.strip())
    except ValueError as exc:
        raise ValueError(f"Adresse CIDR invalide : {exc}")

    network = interface.network

    hosts = list(network.hosts())
    usable_count = len(hosts)

    return {
        "adresse_saisie": str(interface.ip),
        "masque": str(network.netmask),
        "prefixe": network.prefixlen,
        "adresse_reseau": str(network.network_address),
        "adresse_broadcast": str(network.broadcast_address),
        "premiere_adresse_utilisable": str(hosts[0]) if usable_count else None,
        "derniere_adresse_utilisable": str(hosts[-1]) if usable_count else None,
        "nombre_hotes_utilisables": usable_count,
        "nombre_adresses_totales": network.num_addresses,
        "notation_cidr": str(network),
    }
