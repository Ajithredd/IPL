def calculate_team_points(team_players, metric='overall'):
    """
    Calculates points for a team based on selected players.
    Assumes team_players is a list of player dictionaries with 'fantasy_points'.
    """
    # For now, we just sum up the points of all players provided.
    # The 'squad_size' logic is handled by the frontend sending the correct number of players,
    # or we can enforce it here.
    
    total_points = 0
    breakdown = {}
    
    for player in team_players:
        p_points = player.get('fantasy_points', {})
        # Defaulting to 0 if not found
        
        if metric == 'overall':
             # Sum of all available? Or just the 'overall' field?
             # The prompt said "3 points overall ipl, 2024, 2025".
             # I'll assume 'overall' key maps to "overall ipl".
             score = p_points.get('overall', 0)
        else:
             score = p_points.get(str(metric), 0)
        
        total_points += score
        
        breakdown[player['id']] = score
        
    return {
        'total_points': total_points,
        'breakdown': breakdown
    }
