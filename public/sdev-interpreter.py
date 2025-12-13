#!/usr/bin/env python3
"""
╔═══════════════════════════════════════════════════════════════════════════════╗
║                          SDEV PROGRAMMING LANGUAGE                             ║
║                        A Unique, Expressive Language                           ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  Usage:                                                                        ║
║    python sdev-interpreter.py [file.sdev]  - Run a file                       ║
║    python sdev-interpreter.py              - Start interactive REPL           ║
║                                                                                ║
║  Library Usage:                                                                ║
║    from sdev_interpreter import execute, Interpreter                          ║
║    result = execute('speak("Hello, World!")')                                 ║
╚═══════════════════════════════════════════════════════════════════════════════╝
"""

import sys
import os
import re
import math
import random
import json
import urllib.request
import urllib.error
from enum import Enum, auto
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Callable, Union, Tuple
from abc import ABC, abstractmethod

__version__ = "1.0.0"
__author__ = "sdev Team"

# ============= Token Types =============

class TokenType(Enum):
    NUMBER = auto()
    STRING = auto()
    IDENTIFIER = auto()
    
    # Keywords
    FORGE = auto()       # variable declaration
    CONJURE = auto()     # function declaration
    PONDER = auto()      # if statement
    OTHERWISE = auto()   # else
    CYCLE = auto()       # while loop
    WITHIN = auto()      # for-in loop
    YIELD = auto()       # return
    YEET = auto()        # break
    SKIP = auto()        # continue
    YEP = auto()         # true
    NOPE = auto()        # false
    VOID = auto()        # null
    BE = auto()          # assignment operator
    SUMMON = auto()      # import from gist
    ATTEMPT = auto()     # try
    RESCUE = auto()      # catch
    
    # Operators
    PLUS = auto()
    MINUS = auto()
    STAR = auto()
    SLASH = auto()
    PERCENT = auto()
    CARET = auto()
    
    # Comparison
    EQUALS = auto()
    DIFFERS = auto()
    LESS = auto()
    MORE = auto()
    ATMOST = auto()
    ATLEAST = auto()
    
    # Logical
    ALSO = auto()        # and
    EITHER = auto()      # or
    ISNT = auto()        # not
    
    # Delimiters
    LPAREN = auto()
    RPAREN = auto()
    LBRACKET = auto()
    RBRACKET = auto()
    COMMA = auto()
    ARROW = auto()
    PIPE = auto()
    DOUBLE_COLON = auto()
    DOUBLE_SEMI = auto()
    COLON = auto()
    DOT = auto()
    TILDE = auto()
    AT = auto()
    
    EOF = auto()

KEYWORDS = {
    'forge': TokenType.FORGE,
    'conjure': TokenType.CONJURE,
    'ponder': TokenType.PONDER,
    'otherwise': TokenType.OTHERWISE,
    'cycle': TokenType.CYCLE,
    'within': TokenType.WITHIN,
    'yield': TokenType.YIELD,
    'yeet': TokenType.YEET,
    'skip': TokenType.SKIP,
    'yep': TokenType.YEP,
    'nope': TokenType.NOPE,
    'void': TokenType.VOID,
    'be': TokenType.BE,
    'also': TokenType.ALSO,
    'either': TokenType.EITHER,
    'isnt': TokenType.ISNT,
    'equals': TokenType.EQUALS,
    'differs': TokenType.DIFFERS,
    'summon': TokenType.SUMMON,
    'attempt': TokenType.ATTEMPT,
    'rescue': TokenType.RESCUE,
}

# ============= Token =============

@dataclass
class Token:
    type: TokenType
    value: str
    line: int
    column: int

# ============= Errors =============

class SdevError(Exception):
    """Base error for sdev interpreter"""
    def __init__(self, message: str, line: int = 0, column: int = 0):
        self.line = line
        self.column = column
        loc = f"[line {line}]" if column == 0 else f"[line {line}, col {column}]"
        super().__init__(f"{loc} {message}")

class ReturnException(Exception):
    """Used to implement return statements"""
    def __init__(self, value: Any):
        self.value = value

class BreakException(Exception):
    """Used to implement break statements"""
    pass

class ContinueException(Exception):
    """Used to implement continue statements"""
    pass

# ============= Lexer =============

class Lexer:
    def __init__(self, source: str):
        self.source = source
        self.pos = 0
        self.line = 1
        self.column = 1
        self.tokens: List[Token] = []
    
    def tokenize(self) -> List[Token]:
        while not self.is_at_end():
            self.scan_token()
        self.tokens.append(Token(TokenType.EOF, '', self.line, self.column))
        return self.tokens
    
    def scan_token(self):
        self.skip_whitespace()
        if self.is_at_end():
            return
        
        start_column = self.column
        char = self.advance()
        
        # Single character tokens
        single_tokens = {
            '(': TokenType.LPAREN,
            ')': TokenType.RPAREN,
            '[': TokenType.LBRACKET,
            ']': TokenType.RBRACKET,
            ',': TokenType.COMMA,
            '.': TokenType.DOT,
            '+': TokenType.PLUS,
            '*': TokenType.STAR,
            '%': TokenType.PERCENT,
            '^': TokenType.CARET,
            '~': TokenType.TILDE,
            '@': TokenType.AT,
        }
        
        if char in single_tokens:
            self.add_token(single_tokens[char], char, start_column)
            return
        
        # Two character tokens
        if char == '-':
            if self.peek() == '>':
                self.advance()
                self.add_token(TokenType.ARROW, '->', start_column)
            else:
                self.add_token(TokenType.MINUS, char, start_column)
            return
        
        if char == '|':
            if self.peek() == '>':
                self.advance()
                self.add_token(TokenType.PIPE, '|>', start_column)
            else:
                raise SdevError(f"Unexpected character: '{char}'", self.line, start_column)
            return
        
        if char == ':':
            if self.peek() == ':':
                self.advance()
                self.add_token(TokenType.DOUBLE_COLON, '::', start_column)
            else:
                self.add_token(TokenType.COLON, ':', start_column)
            return
        
        if char == ';':
            if self.peek() == ';':
                self.advance()
                self.add_token(TokenType.DOUBLE_SEMI, ';;', start_column)
            return
        
        if char == '/':
            if self.peek() == '/':
                # Comment - skip to end of line
                while not self.is_at_end() and self.peek() != '\n':
                    self.advance()
                return
            self.add_token(TokenType.SLASH, char, start_column)
            return
        
        if char == '#':
            # Also a comment
            while not self.is_at_end() and self.peek() != '\n':
                self.advance()
            return
        
        if char == '<':
            if self.peek() == '>':
                self.advance()
                self.add_token(TokenType.DIFFERS, '<>', start_column)
            elif self.peek() == '=':
                self.advance()
                self.add_token(TokenType.ATMOST, '<=', start_column)
            else:
                self.add_token(TokenType.LESS, '<', start_column)
            return
        
        if char == '>':
            if self.peek() == '=':
                self.advance()
                self.add_token(TokenType.ATLEAST, '>=', start_column)
            else:
                self.add_token(TokenType.MORE, '>', start_column)
            return
        
        # String literals
        if char in '"\'`':
            self.scan_string(char, start_column)
            return
        
        # Numbers
        if char.isdigit():
            self.scan_number(char, start_column)
            return
        
        # Identifiers and keywords
        if char.isalpha() or char == '_':
            self.scan_identifier(char, start_column)
            return
        
        raise SdevError(f"Unexpected character: '{char}'", self.line, start_column)
    
    def scan_string(self, quote: str, start_column: int):
        value = ''
        start_line = self.line
        while not self.is_at_end() and self.peek() != quote:
            if self.peek() == '\n':
                if quote == '`':
                    value += self.advance()
                    self.line += 1
                    self.column = 1
                    continue
                raise SdevError('Unterminated string', start_line, start_column)
            if self.peek() == '\\':
                self.advance()
                if self.is_at_end():
                    raise SdevError('Unterminated string', start_line, start_column)
                escaped = self.advance()
                escapes = {'n': '\n', 't': '\t', 'r': '\r', '\\': '\\', '"': '"', "'": "'", '`': '`', '0': '\0'}
                value += escapes.get(escaped, escaped)
            else:
                value += self.advance()
        if self.is_at_end():
            raise SdevError('Unterminated string', start_line, start_column)
        self.advance()  # closing quote
        self.add_token(TokenType.STRING, value, start_column)
    
    def scan_number(self, first: str, start_column: int):
        value = first
        while self.peek().isdigit():
            value += self.advance()
        if self.peek() == '.' and self.peek_next().isdigit():
            value += self.advance()
            while self.peek().isdigit():
                value += self.advance()
        # Scientific notation
        if self.peek().lower() == 'e':
            value += self.advance()
            if self.peek() in '+-':
                value += self.advance()
            while self.peek().isdigit():
                value += self.advance()
        self.add_token(TokenType.NUMBER, value, start_column)
    
    def scan_identifier(self, first: str, start_column: int):
        value = first
        while self.peek().isalnum() or self.peek() == '_':
            value += self.advance()
        token_type = KEYWORDS.get(value, TokenType.IDENTIFIER)
        self.add_token(token_type, value, start_column)
    
    def skip_whitespace(self):
        while not self.is_at_end():
            char = self.peek()
            if char in ' \t\r':
                self.advance()
            elif char == '\n':
                self.line += 1
                self.column = 0
                self.advance()
            else:
                break
    
    def is_at_end(self) -> bool:
        return self.pos >= len(self.source)
    
    def peek(self) -> str:
        return self.source[self.pos] if self.pos < len(self.source) else '\0'
    
    def peek_next(self) -> str:
        return self.source[self.pos + 1] if self.pos + 1 < len(self.source) else '\0'
    
    def advance(self) -> str:
        char = self.source[self.pos]
        self.pos += 1
        self.column += 1
        return char
    
    def add_token(self, token_type: TokenType, value: str, column: int):
        self.tokens.append(Token(token_type, value, self.line, column))

# ============= AST Nodes =============

@dataclass
class ASTNode:
    line: int

@dataclass
class NumberLiteral(ASTNode):
    value: float

@dataclass
class StringLiteral(ASTNode):
    value: str

@dataclass
class BooleanLiteral(ASTNode):
    value: bool

@dataclass
class NullLiteral(ASTNode):
    pass

@dataclass
class Identifier(ASTNode):
    name: str

@dataclass
class BinaryExpr(ASTNode):
    operator: str
    left: ASTNode
    right: ASTNode

@dataclass
class UnaryExpr(ASTNode):
    operator: str
    operand: ASTNode

@dataclass
class CallExpr(ASTNode):
    callee: ASTNode
    args: List[ASTNode]

@dataclass
class IndexExpr(ASTNode):
    obj: ASTNode
    index: ASTNode

@dataclass
class SliceExpr(ASTNode):
    obj: ASTNode
    start: Optional[ASTNode]
    end: Optional[ASTNode]
    step: Optional[ASTNode]

@dataclass
class MemberExpr(ASTNode):
    obj: ASTNode
    property: str

@dataclass
class ArrayLiteral(ASTNode):
    elements: List[ASTNode]

@dataclass
class DictLiteral(ASTNode):
    entries: List[Tuple[ASTNode, ASTNode]]

@dataclass
class LambdaExpr(ASTNode):
    params: List[str]
    body: ASTNode

@dataclass
class LetStatement(ASTNode):
    name: str
    value: ASTNode

@dataclass
class AssignStatement(ASTNode):
    name: str
    value: ASTNode

@dataclass
class IndexAssignStatement(ASTNode):
    obj: ASTNode
    index: ASTNode
    value: ASTNode

@dataclass
class MemberAssignStatement(ASTNode):
    obj: ASTNode
    property: str
    value: ASTNode

@dataclass
class IfStatement(ASTNode):
    condition: ASTNode
    then_branch: 'BlockStatement'
    else_branch: Optional[Union['BlockStatement', 'IfStatement']] = None

@dataclass
class WhileStatement(ASTNode):
    condition: ASTNode
    body: 'BlockStatement'

@dataclass
class ForInStatement(ASTNode):
    var_name: str
    iterable: ASTNode
    body: 'BlockStatement'

@dataclass
class TryStatement(ASTNode):
    try_block: 'BlockStatement'
    error_var: Optional[str]
    catch_block: Optional['BlockStatement']

@dataclass
class FuncDeclaration(ASTNode):
    name: str
    params: List[str]
    body: 'BlockStatement'

@dataclass
class ReturnStatement(ASTNode):
    value: Optional[ASTNode] = None

@dataclass
class BreakStatement(ASTNode):
    pass

@dataclass
class ContinueStatement(ASTNode):
    pass

@dataclass
class BlockStatement(ASTNode):
    statements: List[ASTNode]

@dataclass
class ExpressionStatement(ASTNode):
    expression: ASTNode

@dataclass
class Program(ASTNode):
    statements: List[ASTNode]

# ============= Parser =============

class Parser:
    def __init__(self, tokens: List[Token]):
        self.tokens = tokens
        self.pos = 0
    
    def parse(self) -> Program:
        statements = []
        while not self.is_at_end():
            stmt = self.parse_statement()
            if stmt:
                statements.append(stmt)
        return Program(1, statements)
    
    def parse_statement(self) -> Optional[ASTNode]:
        if self.check(TokenType.FORGE):
            return self.parse_forge_statement()
        if self.check(TokenType.CONJURE):
            return self.parse_conjure_declaration()
        if self.check(TokenType.PONDER):
            return self.parse_ponder_statement()
        if self.check(TokenType.CYCLE):
            return self.parse_cycle_statement()
        if self.check(TokenType.WITHIN):
            return self.parse_within_statement()
        if self.check(TokenType.YIELD):
            return self.parse_yield_statement()
        if self.check(TokenType.YEET):
            return self.parse_break_statement()
        if self.check(TokenType.SKIP):
            return self.parse_continue_statement()
        if self.check(TokenType.ATTEMPT):
            return self.parse_attempt_statement()
        if self.check(TokenType.DOUBLE_COLON):
            return self.parse_block_statement()
        return self.parse_expression_statement()
    
    def parse_forge_statement(self) -> LetStatement:
        forge_token = self.consume(TokenType.FORGE, "Expected 'forge'")
        name = self.consume(TokenType.IDENTIFIER, "Expected variable name").value
        self.consume(TokenType.BE, "Expected 'be'")
        value = self.parse_expression()
        return LetStatement(forge_token.line, name, value)
    
    def parse_conjure_declaration(self) -> FuncDeclaration:
        conjure_token = self.consume(TokenType.CONJURE, "Expected 'conjure'")
        name = self.consume(TokenType.IDENTIFIER, "Expected function name").value
        self.consume(TokenType.LPAREN, "Expected '('")
        
        params = []
        if not self.check(TokenType.RPAREN):
            params.append(self.consume(TokenType.IDENTIFIER, "Expected parameter name").value)
            while self.match(TokenType.COMMA):
                params.append(self.consume(TokenType.IDENTIFIER, "Expected parameter name").value)
        self.consume(TokenType.RPAREN, "Expected ')'")
        
        body = self.parse_block_statement()
        return FuncDeclaration(conjure_token.line, name, params, body)
    
    def parse_ponder_statement(self) -> IfStatement:
        ponder_token = self.consume(TokenType.PONDER, "Expected 'ponder'")
        condition = self.parse_expression()
        then_branch = self.parse_block_statement()
        
        else_branch = None
        if self.match(TokenType.OTHERWISE):
            if self.check(TokenType.PONDER):
                else_branch = self.parse_ponder_statement()
            else:
                else_branch = self.parse_block_statement()
        
        return IfStatement(ponder_token.line, condition, then_branch, else_branch)
    
    def parse_cycle_statement(self) -> WhileStatement:
        cycle_token = self.consume(TokenType.CYCLE, "Expected 'cycle'")
        condition = self.parse_expression()
        body = self.parse_block_statement()
        return WhileStatement(cycle_token.line, condition, body)
    
    def parse_within_statement(self) -> ForInStatement:
        within_token = self.consume(TokenType.WITHIN, "Expected 'within'")
        var_name = self.consume(TokenType.IDENTIFIER, "Expected variable name").value
        self.consume(TokenType.BE, "Expected 'be'") 
        iterable = self.parse_expression()
        body = self.parse_block_statement()
        return ForInStatement(within_token.line, var_name, iterable, body)
    
    def parse_yield_statement(self) -> ReturnStatement:
        yield_token = self.consume(TokenType.YIELD, "Expected 'yield'")
        value = None
        if not self.check(TokenType.DOUBLE_SEMI) and not self.is_at_end():
            if not self.check(TokenType.FORGE) and not self.check(TokenType.CONJURE) and \
               not self.check(TokenType.PONDER) and not self.check(TokenType.CYCLE):
                value = self.parse_expression()
        return ReturnStatement(yield_token.line, value)
    
    def parse_break_statement(self) -> BreakStatement:
        yeet_token = self.consume(TokenType.YEET, "Expected 'yeet'")
        return BreakStatement(yeet_token.line)
    
    def parse_continue_statement(self) -> ContinueStatement:
        skip_token = self.consume(TokenType.SKIP, "Expected 'skip'")
        return ContinueStatement(skip_token.line)
    
    def parse_attempt_statement(self) -> TryStatement:
        attempt_token = self.consume(TokenType.ATTEMPT, "Expected 'attempt'")
        try_block = self.parse_block_statement()
        
        error_var = None
        catch_block = None
        if self.match(TokenType.RESCUE):
            if self.check(TokenType.IDENTIFIER):
                error_var = self.consume(TokenType.IDENTIFIER, "Expected error variable").value
            catch_block = self.parse_block_statement()
        
        return TryStatement(attempt_token.line, try_block, error_var, catch_block)
    
    def parse_block_statement(self) -> BlockStatement:
        colon_token = self.consume(TokenType.DOUBLE_COLON, "Expected '::'")
        statements = []
        while not self.check(TokenType.DOUBLE_SEMI) and not self.is_at_end():
            stmt = self.parse_statement()
            if stmt:
                statements.append(stmt)
        self.consume(TokenType.DOUBLE_SEMI, "Expected ';;'")
        return BlockStatement(colon_token.line, statements)
    
    def parse_expression_statement(self) -> Optional[ASTNode]:
        expr = self.parse_expression()
        
        if self.match(TokenType.BE):
            value = self.parse_expression()
            
            if isinstance(expr, Identifier):
                return AssignStatement(expr.line, expr.name, value)
            if isinstance(expr, IndexExpr):
                return IndexAssignStatement(expr.line, expr.obj, expr.index, value)
            if isinstance(expr, MemberExpr):
                return MemberAssignStatement(expr.line, expr.obj, expr.property, value)
            raise SdevError('Invalid assignment target', expr.line)
        
        return ExpressionStatement(expr.line, expr)
    
    def parse_expression(self) -> ASTNode:
        return self.parse_ternary()
    
    def parse_ternary(self) -> ASTNode:
        expr = self.parse_pipe()
        
        if self.match(TokenType.TILDE):
            then_val = self.parse_expression()
            self.consume(TokenType.COLON, "Expected ':' in ternary")
            else_val = self.parse_expression()
            # Create inline if expression
            return CallExpr(expr.line, Identifier(expr.line, '__ternary__'), [expr, then_val, else_val])
        
        return expr
    
    def parse_pipe(self) -> ASTNode:
        left = self.parse_or()
        
        while self.match(TokenType.PIPE):
            right = self.parse_or()
            if isinstance(right, CallExpr):
                right.args.insert(0, left)
                left = right
            elif isinstance(right, Identifier):
                left = CallExpr(left.line, right, [left])
            else:
                raise SdevError('Pipe target must be a function or call', right.line)
        
        return left
    
    def parse_or(self) -> ASTNode:
        left = self.parse_and()
        while self.match(TokenType.EITHER):
            right = self.parse_and()
            left = BinaryExpr(left.line, 'either', left, right)
        return left
    
    def parse_and(self) -> ASTNode:
        left = self.parse_equality()
        while self.match(TokenType.ALSO):
            right = self.parse_equality()
            left = BinaryExpr(left.line, 'also', left, right)
        return left
    
    def parse_equality(self) -> ASTNode:
        left = self.parse_comparison()
        while self.match(TokenType.EQUALS, TokenType.DIFFERS):
            operator = 'equals' if self.previous().type == TokenType.EQUALS else 'differs'
            right = self.parse_comparison()
            left = BinaryExpr(left.line, operator, left, right)
        return left
    
    def parse_comparison(self) -> ASTNode:
        left = self.parse_term()
        while self.match(TokenType.LESS, TokenType.MORE, TokenType.ATMOST, TokenType.ATLEAST):
            operator = self.previous().value
            right = self.parse_term()
            left = BinaryExpr(left.line, operator, left, right)
        return left
    
    def parse_term(self) -> ASTNode:
        left = self.parse_factor()
        while self.match(TokenType.PLUS, TokenType.MINUS):
            operator = self.previous().value
            right = self.parse_factor()
            left = BinaryExpr(left.line, operator, left, right)
        return left
    
    def parse_factor(self) -> ASTNode:
        left = self.parse_power()
        while self.match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT):
            operator = self.previous().value
            right = self.parse_power()
            left = BinaryExpr(left.line, operator, left, right)
        return left
    
    def parse_power(self) -> ASTNode:
        left = self.parse_unary()
        while self.match(TokenType.CARET):
            right = self.parse_unary()
            left = BinaryExpr(left.line, '^', left, right)
        return left
    
    def parse_unary(self) -> ASTNode:
        if self.match(TokenType.MINUS, TokenType.ISNT):
            operator = self.previous().value
            operand = self.parse_unary()
            return UnaryExpr(self.previous().line, operator, operand)
        return self.parse_call()
    
    def parse_call(self) -> ASTNode:
        expr = self.parse_primary()
        
        while True:
            if self.match(TokenType.LPAREN):
                expr = self.finish_call(expr)
            elif self.match(TokenType.LBRACKET):
                expr = self.parse_index_or_slice(expr)
            elif self.match(TokenType.DOT):
                prop = self.consume(TokenType.IDENTIFIER, "Expected property name").value
                expr = MemberExpr(expr.line, expr, prop)
            elif self.match(TokenType.ARROW):
                if isinstance(expr, Identifier):
                    body = self.parse_expression()
                    expr = LambdaExpr(expr.line, [expr.name], body)
                else:
                    raise SdevError('Invalid lambda syntax', expr.line)
            else:
                break
        
        return expr
    
    def parse_index_or_slice(self, obj: ASTNode) -> ASTNode:
        # Check for slice syntax: [start:end:step] or simple index [idx]
        start = None
        end = None
        step = None
        
        if self.check(TokenType.COLON):
            # [:...] - no start
            pass
        elif not self.check(TokenType.RBRACKET):
            start = self.parse_expression()
        
        if self.match(TokenType.COLON):
            # This is a slice
            if not self.check(TokenType.COLON) and not self.check(TokenType.RBRACKET):
                end = self.parse_expression()
            if self.match(TokenType.COLON):
                if not self.check(TokenType.RBRACKET):
                    step = self.parse_expression()
            self.consume(TokenType.RBRACKET, "Expected ']'")
            return SliceExpr(obj.line, obj, start, end, step)
        else:
            self.consume(TokenType.RBRACKET, "Expected ']'")
            return IndexExpr(obj.line, obj, start)
    
    def finish_call(self, callee: ASTNode) -> CallExpr:
        args = []
        if not self.check(TokenType.RPAREN):
            args.append(self.parse_expression())
            while self.match(TokenType.COMMA):
                args.append(self.parse_expression())
        self.consume(TokenType.RPAREN, "Expected ')'")
        return CallExpr(callee.line, callee, args)
    
    def parse_primary(self) -> ASTNode:
        token = self.peek()
        
        if self.match(TokenType.NUMBER):
            return NumberLiteral(token.line, float(token.value))
        
        if self.match(TokenType.STRING):
            return StringLiteral(token.line, token.value)
        
        if self.match(TokenType.YEP):
            return BooleanLiteral(token.line, True)
        
        if self.match(TokenType.NOPE):
            return BooleanLiteral(token.line, False)
        
        if self.match(TokenType.VOID):
            return NullLiteral(token.line)
        
        if self.match(TokenType.IDENTIFIER):
            return Identifier(token.line, token.value)
        
        if self.match(TokenType.LPAREN):
            exprs = []
            names = []
            is_lambda_params = True
            
            if not self.check(TokenType.RPAREN):
                expr = self.parse_expression()
                exprs.append(expr)
                if not isinstance(expr, Identifier):
                    is_lambda_params = False
                else:
                    names.append(expr.name)
                
                while self.match(TokenType.COMMA):
                    expr = self.parse_expression()
                    exprs.append(expr)
                    if not isinstance(expr, Identifier):
                        is_lambda_params = False
                    elif is_lambda_params:
                        names.append(expr.name)
            
            self.consume(TokenType.RPAREN, "Expected ')'")
            
            if self.match(TokenType.ARROW):
                if not is_lambda_params:
                    raise SdevError('Invalid lambda parameters', token.line)
                body = self.parse_expression()
                return LambdaExpr(token.line, names, body)
            
            if len(exprs) == 1:
                return exprs[0]
            if len(exprs) == 0:
                # Empty parens for unit/void
                return NullLiteral(token.line)
            raise SdevError('Unexpected multiple expressions', token.line)
        
        if self.match(TokenType.LBRACKET):
            return self.parse_array_literal(token.line)
        
        if self.match(TokenType.DOUBLE_COLON):
            return self.parse_dict_literal(token.line)
        
        raise SdevError(f"Unexpected token: '{token.value}'", token.line, token.column)
    
    def parse_array_literal(self, line: int) -> ArrayLiteral:
        elements = []
        if not self.check(TokenType.RBRACKET):
            elements.append(self.parse_expression())
            while self.match(TokenType.COMMA):
                if self.check(TokenType.RBRACKET):
                    break  # Allow trailing comma
                elements.append(self.parse_expression())
        self.consume(TokenType.RBRACKET, "Expected ']'")
        return ArrayLiteral(line, elements)
    
    def parse_dict_literal(self, line: int) -> DictLiteral:
        entries = []
        if not self.check(TokenType.DOUBLE_SEMI):
            key = self.parse_expression()
            self.consume(TokenType.COLON, "Expected ':'")
            value = self.parse_expression()
            entries.append((key, value))
            while self.match(TokenType.COMMA):
                if self.check(TokenType.DOUBLE_SEMI):
                    break  # Allow trailing comma
                key = self.parse_expression()
                self.consume(TokenType.COLON, "Expected ':'")
                value = self.parse_expression()
                entries.append((key, value))
        self.consume(TokenType.DOUBLE_SEMI, "Expected ';;'")
        return DictLiteral(line, entries)
    
    # Helper methods
    def peek(self) -> Token:
        return self.tokens[self.pos]
    
    def previous(self) -> Token:
        return self.tokens[self.pos - 1]
    
    def is_at_end(self) -> bool:
        return self.peek().type == TokenType.EOF
    
    def check(self, token_type: TokenType) -> bool:
        return not self.is_at_end() and self.peek().type == token_type
    
    def match(self, *types: TokenType) -> bool:
        for t in types:
            if self.check(t):
                self.advance()
                return True
        return False
    
    def advance(self) -> Token:
        if not self.is_at_end():
            self.pos += 1
        return self.previous()
    
    def consume(self, token_type: TokenType, message: str) -> Token:
        if self.check(token_type):
            return self.advance()
        raise SdevError(message, self.peek().line, self.peek().column)

# ============= Environment =============

class Environment:
    def __init__(self, parent: Optional['Environment'] = None):
        self.values: Dict[str, Any] = {}
        self.parent = parent
    
    def define(self, name: str, value: Any):
        self.values[name] = value
    
    def get(self, name: str, line: int = 0) -> Any:
        if name in self.values:
            return self.values[name]
        if self.parent:
            return self.parent.get(name, line)
        raise SdevError(f"Undefined variable: '{name}'", line)
    
    def set(self, name: str, value: Any, line: int = 0):
        if name in self.values:
            self.values[name] = value
            return
        if self.parent:
            self.parent.set(name, value, line)
            return
        raise SdevError(f"Undefined variable: '{name}'", line)
    
    def has(self, name: str) -> bool:
        if name in self.values:
            return True
        if self.parent:
            return self.parent.has(name)
        return False

# ============= Function Types =============

@dataclass
class SdevBuiltin:
    name: str
    func: Callable
    min_args: int = 0
    max_args: int = -1  # -1 means unlimited

@dataclass
class SdevUserFunc:
    name: str
    params: List[str]
    body: BlockStatement
    closure: Environment

@dataclass
class SdevLambda:
    params: List[str]
    body: ASTNode
    closure: Environment

# ============= Interpreter =============

class Interpreter:
    def __init__(self, output_callback: Callable[[str], None] = print):
        self.output = output_callback
        self.global_env = Environment()
        self.max_iterations = 1_000_000
        self._register_builtins()
    
    def _register_builtins(self):
        """Register all built-in functions and constants"""
        builtins = self._create_builtins()
        for name, func in builtins.items():
            self.global_env.define(name, func)
        
        # Register constants
        self.global_env.define('PI', math.pi)
        self.global_env.define('TAU', math.tau)
        self.global_env.define('E', math.e)
        self.global_env.define('INFINITY', float('inf'))
    
    def _create_builtins(self) -> Dict[str, SdevBuiltin]:
        """Create all built-in functions"""
        builtins = {}
        
        # ========== Output Functions ==========
        def speak(args, line):
            msg = ' '.join(self._stringify(a) for a in args)
            self.output(msg)
            return None
        builtins['speak'] = SdevBuiltin('speak', speak)
        
        def whisper(args, line):
            msg = ''.join(self._stringify(a) for a in args)
            self.output(msg)
            return None
        builtins['whisper'] = SdevBuiltin('whisper', whisper)
        
        def shout(args, line):
            msg = ' '.join(self._stringify(a) for a in args).upper()
            self.output(msg)
            return None
        builtins['shout'] = SdevBuiltin('shout', shout)
        
        # ========== Collection Functions ==========
        def measure(args, line):
            if len(args) != 1:
                raise SdevError('measure() takes exactly 1 argument', line)
            arg = args[0]
            if isinstance(arg, (str, list)):
                return len(arg)
            if isinstance(arg, dict):
                return len(arg)
            raise SdevError('measure() argument must be text, list, or tome', line)
        builtins['measure'] = SdevBuiltin('measure', measure, 1, 1)
        
        def sequence(args, line):
            if len(args) < 1 or len(args) > 3:
                raise SdevError('sequence() takes 1 to 3 arguments', line)
            if len(args) == 1:
                return list(range(int(args[0])))
            elif len(args) == 2:
                return list(range(int(args[0]), int(args[1])))
            else:
                return list(range(int(args[0]), int(args[1]), int(args[2])))
        builtins['sequence'] = SdevBuiltin('sequence', sequence, 1, 3)
        
        def gather(args, line):
            if len(args) != 2:
                raise SdevError('gather() takes 2 arguments', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            arr.append(args[1])
            return arr
        builtins['gather'] = SdevBuiltin('gather', gather, 2, 2)
        
        def pluck(args, line):
            if len(args) != 1:
                raise SdevError('pluck() takes 1 argument', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('Argument must be a list', line)
            if len(arr) == 0:
                raise SdevError('Cannot pluck from empty list', line)
            return arr.pop()
        builtins['pluck'] = SdevBuiltin('pluck', pluck, 1, 1)
        
        def snatch(args, line):
            """Remove and return item at index"""
            if len(args) != 2:
                raise SdevError('snatch() takes 2 arguments (list, index)', line)
            arr = args[0]
            idx = int(args[1])
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            if idx < -len(arr) or idx >= len(arr):
                raise SdevError('Index out of bounds', line)
            return arr.pop(idx)
        builtins['snatch'] = SdevBuiltin('snatch', snatch, 2, 2)
        
        def insert(args, line):
            """Insert item at index"""
            if len(args) != 3:
                raise SdevError('insert() takes 3 arguments (list, index, item)', line)
            arr = args[0]
            idx = int(args[1])
            item = args[2]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            arr.insert(idx, item)
            return arr
        builtins['insert'] = SdevBuiltin('insert', insert, 3, 3)
        
        def portion(args, line):
            if len(args) < 2 or len(args) > 3:
                raise SdevError('portion() takes 2 or 3 arguments', line)
            arr = args[0]
            if not isinstance(arr, (list, str)):
                raise SdevError('First argument must be a list or text', line)
            start = int(args[1])
            end = int(args[2]) if len(args) == 3 else None
            return arr[start:end]
        builtins['portion'] = SdevBuiltin('portion', portion, 2, 3)
        
        def weave(args, line):
            if len(args) != 2:
                raise SdevError('weave() takes 2 arguments', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            sep = args[1]
            if not isinstance(sep, str):
                raise SdevError('Second argument must be text', line)
            return sep.join(self._stringify(item) for item in arr)
        builtins['weave'] = SdevBuiltin('weave', weave, 2, 2)
        
        def shatter(args, line):
            if len(args) < 1 or len(args) > 2:
                raise SdevError('shatter() takes 1 or 2 arguments', line)
            text = args[0]
            if not isinstance(text, str):
                raise SdevError('First argument must be text', line)
            sep = args[1] if len(args) > 1 else None
            if sep is not None and not isinstance(sep, str):
                raise SdevError('Second argument must be text', line)
            return text.split(sep)
        builtins['shatter'] = SdevBuiltin('shatter', shatter, 1, 2)
        
        def clone(args, line):
            """Deep copy a value"""
            if len(args) != 1:
                raise SdevError('clone() takes 1 argument', line)
            import copy
            return copy.deepcopy(args[0])
        builtins['clone'] = SdevBuiltin('clone', clone, 1, 1)
        
        # ========== Higher-Order Functions ==========
        def each(args, line):
            if len(args) != 2:
                raise SdevError('each() takes 2 arguments (list, transform)', line)
            arr = args[0]
            fn = args[1]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            return [self._call_function(fn, [item, i], line) for i, item in enumerate(arr)]
        builtins['each'] = SdevBuiltin('each', each, 2, 2)
        
        def sift(args, line):
            if len(args) != 2:
                raise SdevError('sift() takes 2 arguments (list, predicate)', line)
            arr = args[0]
            fn = args[1]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            return [item for item in arr if self._is_truthy(self._call_function(fn, [item], line))]
        builtins['sift'] = SdevBuiltin('sift', sift, 2, 2)
        
        def fold(args, line):
            if len(args) != 3:
                raise SdevError('fold() takes 3 arguments (list, initial, reducer)', line)
            arr = args[0]
            acc = args[1]
            fn = args[2]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            for item in arr:
                acc = self._call_function(fn, [acc, item], line)
            return acc
        builtins['fold'] = SdevBuiltin('fold', fold, 3, 3)
        
        def seek(args, line):
            """Find first element matching predicate"""
            if len(args) != 2:
                raise SdevError('seek() takes 2 arguments (list, predicate)', line)
            arr = args[0]
            fn = args[1]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            for item in arr:
                if self._is_truthy(self._call_function(fn, [item], line)):
                    return item
            return None
        builtins['seek'] = SdevBuiltin('seek', seek, 2, 2)
        
        def every(args, line):
            """Check if all elements match predicate"""
            if len(args) != 2:
                raise SdevError('every() takes 2 arguments (list, predicate)', line)
            arr = args[0]
            fn = args[1]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            return all(self._is_truthy(self._call_function(fn, [item], line)) for item in arr)
        builtins['every'] = SdevBuiltin('every', every, 2, 2)
        
        def some(args, line):
            """Check if any element matches predicate"""
            if len(args) != 2:
                raise SdevError('some() takes 2 arguments (list, predicate)', line)
            arr = args[0]
            fn = args[1]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            return any(self._is_truthy(self._call_function(fn, [item], line)) for item in arr)
        builtins['some'] = SdevBuiltin('some', some, 2, 2)
        
        def zip_lists(args, line):
            """Zip multiple lists together"""
            if len(args) < 2:
                raise SdevError('zip() takes at least 2 arguments', line)
            for arg in args:
                if not isinstance(arg, list):
                    raise SdevError('All arguments must be lists', line)
            return [list(t) for t in zip(*args)]
        builtins['zip'] = SdevBuiltin('zip', zip_lists, 2)
        
        def enumerate_list(args, line):
            """Return list of [index, item] pairs"""
            if len(args) != 1:
                raise SdevError('enumerate() takes 1 argument', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('Argument must be a list', line)
            return [[i, item] for i, item in enumerate(arr)]
        builtins['enumerate'] = SdevBuiltin('enumerate', enumerate_list, 1, 1)
        
        # ========== Type Conversion ==========
        def morph(args, line):
            if len(args) != 2:
                raise SdevError('morph() takes 2 arguments (value, type)', line)
            val = args[0]
            target = args[1]
            if not isinstance(target, str):
                raise SdevError('Second argument must be type name', line)
            
            if target == 'number':
                if isinstance(val, (int, float)):
                    return val
                if isinstance(val, str):
                    try:
                        return float(val) if '.' in val else int(val)
                    except ValueError:
                        raise SdevError(f"Cannot morph '{val}' to number", line)
                if isinstance(val, bool):
                    return 1 if val else 0
                raise SdevError('Cannot morph to number', line)
            elif target == 'text':
                return self._stringify(val)
            elif target == 'truth':
                return self._is_truthy(val)
            elif target == 'list':
                if isinstance(val, list):
                    return val
                if isinstance(val, str):
                    return list(val)
                if isinstance(val, dict):
                    return list(val.items())
                raise SdevError('Cannot morph to list', line)
            else:
                raise SdevError(f"Unknown type: {target}", line)
        builtins['morph'] = SdevBuiltin('morph', morph, 2, 2)
        
        def essence(args, line):
            if len(args) != 1:
                raise SdevError('essence() takes 1 argument', line)
            val = args[0]
            if val is None:
                return 'void'
            if isinstance(val, bool):
                return 'truth'
            if isinstance(val, (int, float)):
                return 'number'
            if isinstance(val, str):
                return 'text'
            if isinstance(val, list):
                return 'list'
            if isinstance(val, dict):
                return 'tome'
            if isinstance(val, (SdevBuiltin, SdevUserFunc, SdevLambda)):
                return 'conjuration'
            return 'mystery'
        builtins['essence'] = SdevBuiltin('essence', essence, 1, 1)
        
        # ========== Math Functions ==========
        def magnitude(args, line):
            if len(args) != 1:
                raise SdevError('magnitude() takes 1 argument', line)
            return abs(args[0])
        builtins['magnitude'] = SdevBuiltin('magnitude', magnitude, 1, 1)
        
        def least(args, line):
            if len(args) == 0:
                raise SdevError('least() takes at least 1 argument', line)
            if len(args) == 1 and isinstance(args[0], list):
                if len(args[0]) == 0:
                    raise SdevError('Cannot find least of empty list', line)
                return min(args[0])
            return min(args)
        builtins['least'] = SdevBuiltin('least', least, 1)
        
        def greatest(args, line):
            if len(args) == 0:
                raise SdevError('greatest() takes at least 1 argument', line)
            if len(args) == 1 and isinstance(args[0], list):
                if len(args[0]) == 0:
                    raise SdevError('Cannot find greatest of empty list', line)
                return max(args[0])
            return max(args)
        builtins['greatest'] = SdevBuiltin('greatest', greatest, 1)
        
        def root(args, line):
            if len(args) != 1:
                raise SdevError('root() takes 1 argument', line)
            return math.sqrt(args[0])
        builtins['root'] = SdevBuiltin('root', root, 1, 1)
        
        def ground(args, line):
            if len(args) != 1:
                raise SdevError('ground() takes 1 argument', line)
            return math.floor(args[0])
        builtins['ground'] = SdevBuiltin('ground', ground, 1, 1)
        
        def elevate(args, line):
            if len(args) != 1:
                raise SdevError('elevate() takes 1 argument', line)
            return math.ceil(args[0])
        builtins['elevate'] = SdevBuiltin('elevate', elevate, 1, 1)
        
        def nearby(args, line):
            if len(args) < 1 or len(args) > 2:
                raise SdevError('nearby() takes 1 or 2 arguments', line)
            if len(args) == 2:
                return round(args[0], int(args[1]))
            return round(args[0])
        builtins['nearby'] = SdevBuiltin('nearby', nearby, 1, 2)
        
        def chaos(args, line):
            return random.random()
        builtins['chaos'] = SdevBuiltin('chaos', chaos, 0, 0)
        
        def randint(args, line):
            if len(args) != 2:
                raise SdevError('randint() takes 2 arguments', line)
            return random.randint(int(args[0]), int(args[1]))
        builtins['randint'] = SdevBuiltin('randint', randint, 2, 2)
        
        def pick(args, line):
            if len(args) != 1:
                raise SdevError('pick() takes 1 argument', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('Argument must be a list', line)
            if len(arr) == 0:
                return None
            return random.choice(arr)
        builtins['pick'] = SdevBuiltin('pick', pick, 1, 1)
        
        def shuffle(args, line):
            if len(args) != 1:
                raise SdevError('shuffle() takes 1 argument', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('Argument must be a list', line)
            shuffled = arr.copy()
            random.shuffle(shuffled)
            return shuffled
        builtins['shuffle'] = SdevBuiltin('shuffle', shuffle, 1, 1)
        
        # Trigonometric functions
        builtins['sin'] = SdevBuiltin('sin', lambda a, l: math.sin(a[0]), 1, 1)
        builtins['cos'] = SdevBuiltin('cos', lambda a, l: math.cos(a[0]), 1, 1)
        builtins['tan'] = SdevBuiltin('tan', lambda a, l: math.tan(a[0]), 1, 1)
        builtins['asin'] = SdevBuiltin('asin', lambda a, l: math.asin(a[0]), 1, 1)
        builtins['acos'] = SdevBuiltin('acos', lambda a, l: math.acos(a[0]), 1, 1)
        builtins['atan'] = SdevBuiltin('atan', lambda a, l: math.atan(a[0]), 1, 1)
        builtins['atan2'] = SdevBuiltin('atan2', lambda a, l: math.atan2(a[0], a[1]), 2, 2)
        builtins['sinh'] = SdevBuiltin('sinh', lambda a, l: math.sinh(a[0]), 1, 1)
        builtins['cosh'] = SdevBuiltin('cosh', lambda a, l: math.cosh(a[0]), 1, 1)
        builtins['tanh'] = SdevBuiltin('tanh', lambda a, l: math.tanh(a[0]), 1, 1)
        
        # Logarithmic functions
        builtins['log'] = SdevBuiltin('log', lambda a, l: math.log(a[0]) if len(a) == 1 else math.log(a[0], a[1]), 1, 2)
        builtins['log10'] = SdevBuiltin('log10', lambda a, l: math.log10(a[0]), 1, 1)
        builtins['log2'] = SdevBuiltin('log2', lambda a, l: math.log2(a[0]), 1, 1)
        builtins['exp'] = SdevBuiltin('exp', lambda a, l: math.exp(a[0]), 1, 1)
        
        # ========== String Functions ==========
        def upper(args, line):
            if len(args) != 1:
                raise SdevError('upper() takes 1 argument', line)
            if not isinstance(args[0], str):
                raise SdevError('Argument must be text', line)
            return args[0].upper()
        builtins['upper'] = SdevBuiltin('upper', upper, 1, 1)
        
        def lower(args, line):
            if len(args) != 1:
                raise SdevError('lower() takes 1 argument', line)
            if not isinstance(args[0], str):
                raise SdevError('Argument must be text', line)
            return args[0].lower()
        builtins['lower'] = SdevBuiltin('lower', lower, 1, 1)
        
        def trim(args, line):
            if len(args) != 1:
                raise SdevError('trim() takes 1 argument', line)
            if not isinstance(args[0], str):
                raise SdevError('Argument must be text', line)
            return args[0].strip()
        builtins['trim'] = SdevBuiltin('trim', trim, 1, 1)
        
        def reverse(args, line):
            if len(args) != 1:
                raise SdevError('reverse() takes 1 argument', line)
            val = args[0]
            if isinstance(val, str):
                return val[::-1]
            if isinstance(val, list):
                return val[::-1]
            raise SdevError('Argument must be text or list', line)
        builtins['reverse'] = SdevBuiltin('reverse', reverse, 1, 1)
        
        def contains(args, line):
            if len(args) != 2:
                raise SdevError('contains() takes 2 arguments', line)
            haystack = args[0]
            needle = args[1]
            if isinstance(haystack, str) and isinstance(needle, str):
                return needle in haystack
            if isinstance(haystack, list):
                return needle in haystack
            if isinstance(haystack, dict):
                return needle in haystack
            raise SdevError('First argument must be text, list, or tome', line)
        builtins['contains'] = SdevBuiltin('contains', contains, 2, 2)
        
        def replace(args, line):
            if len(args) != 3:
                raise SdevError('replace() takes 3 arguments', line)
            text = args[0]
            old = args[1]
            new = args[2]
            if not isinstance(text, str):
                raise SdevError('First argument must be text', line)
            return text.replace(str(old), str(new))
        builtins['replace'] = SdevBuiltin('replace', replace, 3, 3)
        
        def starts(args, line):
            if len(args) != 2:
                raise SdevError('starts() takes 2 arguments', line)
            if not isinstance(args[0], str) or not isinstance(args[1], str):
                raise SdevError('Arguments must be text', line)
            return args[0].startswith(args[1])
        builtins['starts'] = SdevBuiltin('starts', starts, 2, 2)
        
        def ends(args, line):
            if len(args) != 2:
                raise SdevError('ends() takes 2 arguments', line)
            if not isinstance(args[0], str) or not isinstance(args[1], str):
                raise SdevError('Arguments must be text', line)
            return args[0].endswith(args[1])
        builtins['ends'] = SdevBuiltin('ends', ends, 2, 2)
        
        def locate(args, line):
            """Find index of substring or item"""
            if len(args) != 2:
                raise SdevError('locate() takes 2 arguments', line)
            haystack = args[0]
            needle = args[1]
            if isinstance(haystack, str):
                return haystack.find(str(needle))
            if isinstance(haystack, list):
                try:
                    return haystack.index(needle)
                except ValueError:
                    return -1
            raise SdevError('First argument must be text or list', line)
        builtins['locate'] = SdevBuiltin('locate', locate, 2, 2)
        
        def chars(args, line):
            """Convert text to list of characters"""
            if len(args) != 1:
                raise SdevError('chars() takes 1 argument', line)
            if not isinstance(args[0], str):
                raise SdevError('Argument must be text', line)
            return list(args[0])
        builtins['chars'] = SdevBuiltin('chars', chars, 1, 1)
        
        def format_str(args, line):
            """Format a string with values"""
            if len(args) < 1:
                raise SdevError('format() takes at least 1 argument', line)
            template = args[0]
            if not isinstance(template, str):
                raise SdevError('First argument must be text', line)
            values = args[1:]
            try:
                return template.format(*values)
            except (IndexError, KeyError) as e:
                raise SdevError(f"Format error: {e}", line)
        builtins['format'] = SdevBuiltin('format', format_str, 1)
        
        def pad_left(args, line):
            if len(args) < 2 or len(args) > 3:
                raise SdevError('padLeft() takes 2 or 3 arguments', line)
            text = str(args[0])
            width = int(args[1])
            fill = args[2] if len(args) > 2 else ' '
            return text.rjust(width, str(fill)[0])
        builtins['padLeft'] = SdevBuiltin('padLeft', pad_left, 2, 3)
        
        def pad_right(args, line):
            if len(args) < 2 or len(args) > 3:
                raise SdevError('padRight() takes 2 or 3 arguments', line)
            text = str(args[0])
            width = int(args[1])
            fill = args[2] if len(args) > 2 else ' '
            return text.ljust(width, str(fill)[0])
        builtins['padRight'] = SdevBuiltin('padRight', pad_right, 2, 3)
        
        # ========== Dict Functions ==========
        def inscriptions(args, line):
            if len(args) != 1:
                raise SdevError('inscriptions() takes 1 argument', line)
            obj = args[0]
            if not isinstance(obj, dict):
                raise SdevError('Argument must be a tome (dict)', line)
            return list(obj.keys())
        builtins['inscriptions'] = SdevBuiltin('inscriptions', inscriptions, 1, 1)
        
        def contents(args, line):
            if len(args) != 1:
                raise SdevError('contents() takes 1 argument', line)
            obj = args[0]
            if not isinstance(obj, dict):
                raise SdevError('Argument must be a tome (dict)', line)
            return list(obj.values())
        builtins['contents'] = SdevBuiltin('contents', contents, 1, 1)
        
        def entries(args, line):
            if len(args) != 1:
                raise SdevError('entries() takes 1 argument', line)
            obj = args[0]
            if not isinstance(obj, dict):
                raise SdevError('Argument must be a tome (dict)', line)
            return [[k, v] for k, v in obj.items()]
        builtins['entries'] = SdevBuiltin('entries', entries, 1, 1)
        
        def merge(args, line):
            """Merge multiple dicts"""
            result = {}
            for arg in args:
                if not isinstance(arg, dict):
                    raise SdevError('All arguments must be tomes', line)
                result.update(arg)
            return result
        builtins['merge'] = SdevBuiltin('merge', merge, 1)
        
        def erase(args, line):
            """Remove key from dict"""
            if len(args) != 2:
                raise SdevError('erase() takes 2 arguments', line)
            obj = args[0]
            key = args[1]
            if not isinstance(obj, dict):
                raise SdevError('First argument must be a tome', line)
            if key in obj:
                del obj[key]
            return obj
        builtins['erase'] = SdevBuiltin('erase', erase, 2, 2)
        
        # ========== Matrix Operations ==========
        def matrix(args, line):
            if len(args) < 2:
                raise SdevError('matrix() takes at least 2 arguments (rows, cols, fill?)', line)
            rows = int(args[0])
            cols = int(args[1])
            fill = args[2] if len(args) > 2 else 0
            return [[fill for _ in range(cols)] for _ in range(rows)]
        builtins['matrix'] = SdevBuiltin('matrix', matrix, 2, 3)
        
        def identity(args, line):
            """Create identity matrix"""
            if len(args) != 1:
                raise SdevError('identity() takes 1 argument', line)
            n = int(args[0])
            return [[1 if i == j else 0 for j in range(n)] for i in range(n)]
        builtins['identity'] = SdevBuiltin('identity', identity, 1, 1)
        
        def transpose(args, line):
            if len(args) != 1:
                raise SdevError('transpose() takes 1 argument', line)
            m = args[0]
            if not isinstance(m, list) or not all(isinstance(row, list) for row in m):
                raise SdevError('Argument must be a 2D list', line)
            if len(m) == 0:
                return []
            return [[m[j][i] for j in range(len(m))] for i in range(len(m[0]))]
        builtins['transpose'] = SdevBuiltin('transpose', transpose, 1, 1)
        
        def dot(args, line):
            if len(args) != 2:
                raise SdevError('dot() takes 2 arguments', line)
            a, b = args[0], args[1]
            if isinstance(a, list) and isinstance(b, list):
                if all(isinstance(x, (int, float)) for x in a) and all(isinstance(x, (int, float)) for x in b):
                    if len(a) != len(b):
                        raise SdevError('Vectors must have same length', line)
                    return sum(x * y for x, y in zip(a, b))
            raise SdevError('Arguments must be numeric lists', line)
        builtins['dot'] = SdevBuiltin('dot', dot, 2, 2)
        
        def matmul(args, line):
            """Matrix multiplication"""
            if len(args) != 2:
                raise SdevError('matmul() takes 2 arguments', line)
            a, b = args[0], args[1]
            if not isinstance(a, list) or not isinstance(b, list):
                raise SdevError('Arguments must be 2D lists', line)
            if len(a) == 0 or len(b) == 0:
                return []
            if len(a[0]) != len(b):
                raise SdevError('Matrix dimensions incompatible', line)
            result = [[0 for _ in range(len(b[0]))] for _ in range(len(a))]
            for i in range(len(a)):
                for j in range(len(b[0])):
                    for k in range(len(b)):
                        result[i][j] += a[i][k] * b[k][j]
            return result
        builtins['matmul'] = SdevBuiltin('matmul', matmul, 2, 2)
        
        def matadd(args, line):
            """Matrix addition"""
            if len(args) != 2:
                raise SdevError('matadd() takes 2 arguments', line)
            a, b = args[0], args[1]
            if not isinstance(a, list) or not isinstance(b, list):
                raise SdevError('Arguments must be 2D lists', line)
            if len(a) != len(b) or (len(a) > 0 and len(a[0]) != len(b[0])):
                raise SdevError('Matrices must have same dimensions', line)
            return [[a[i][j] + b[i][j] for j in range(len(a[0]))] for i in range(len(a))]
        builtins['matadd'] = SdevBuiltin('matadd', matadd, 2, 2)
        
        def matsub(args, line):
            """Matrix subtraction"""
            if len(args) != 2:
                raise SdevError('matsub() takes 2 arguments', line)
            a, b = args[0], args[1]
            if not isinstance(a, list) or not isinstance(b, list):
                raise SdevError('Arguments must be 2D lists', line)
            if len(a) != len(b) or (len(a) > 0 and len(a[0]) != len(b[0])):
                raise SdevError('Matrices must have same dimensions', line)
            return [[a[i][j] - b[i][j] for j in range(len(a[0]))] for i in range(len(a))]
        builtins['matsub'] = SdevBuiltin('matsub', matsub, 2, 2)
        
        def matscale(args, line):
            """Scale matrix by scalar"""
            if len(args) != 2:
                raise SdevError('matscale() takes 2 arguments', line)
            m, scalar = args[0], args[1]
            if not isinstance(m, list):
                raise SdevError('First argument must be a 2D list', line)
            return [[cell * scalar for cell in row] for row in m]
        builtins['matscale'] = SdevBuiltin('matscale', matscale, 2, 2)
        
        def reshape(args, line):
            """Reshape a flat list to 2D"""
            if len(args) != 3:
                raise SdevError('reshape() takes 3 arguments (list, rows, cols)', line)
            arr = args[0]
            rows = int(args[1])
            cols = int(args[2])
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            if len(arr) != rows * cols:
                raise SdevError('List size must equal rows * cols', line)
            return [arr[i*cols:(i+1)*cols] for i in range(rows)]
        builtins['reshape'] = SdevBuiltin('reshape', reshape, 3, 3)
        
        def flatten(args, line):
            """Flatten a 2D list to 1D"""
            if len(args) != 1:
                raise SdevError('flatten() takes 1 argument', line)
            m = args[0]
            if not isinstance(m, list):
                raise SdevError('Argument must be a list', line)
            result = []
            for item in m:
                if isinstance(item, list):
                    result.extend(item)
                else:
                    result.append(item)
            return result
        builtins['flatten'] = SdevBuiltin('flatten', flatten, 1, 1)
        
        def shape(args, line):
            """Get shape of array/matrix"""
            if len(args) != 1:
                raise SdevError('shape() takes 1 argument', line)
            arr = args[0]
            if not isinstance(arr, list):
                return [1]
            if len(arr) == 0:
                return [0]
            if isinstance(arr[0], list):
                return [len(arr), len(arr[0])]
            return [len(arr)]
        builtins['shape'] = SdevBuiltin('shape', shape, 1, 1)
        
        def sum_list(args, line):
            """Sum all elements in a list"""
            if len(args) != 1:
                raise SdevError('sum() takes 1 argument', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('Argument must be a list', line)
            total = 0
            for item in arr:
                if isinstance(item, list):
                    total += sum_list([item], line)
                else:
                    total += item
            return total
        builtins['sum'] = SdevBuiltin('sum', sum_list, 1, 1)
        
        def mean(args, line):
            """Calculate mean of list"""
            if len(args) != 1:
                raise SdevError('mean() takes 1 argument', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('Argument must be a list', line)
            if len(arr) == 0:
                raise SdevError('Cannot calculate mean of empty list', line)
            return sum(arr) / len(arr)
        builtins['mean'] = SdevBuiltin('mean', mean, 1, 1)
        
        # ========== Sorting Functions ==========
        def sort(args, line):
            if len(args) < 1 or len(args) > 2:
                raise SdevError('sort() takes 1 or 2 arguments', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            if len(args) == 2:
                fn = args[1]
                return sorted(arr, key=lambda x: self._call_function(fn, [x], line))
            return sorted(arr)
        builtins['sort'] = SdevBuiltin('sort', sort, 1, 2)
        
        def sortDesc(args, line):
            if len(args) < 1 or len(args) > 2:
                raise SdevError('sortDesc() takes 1 or 2 arguments', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            if len(args) == 2:
                fn = args[1]
                return sorted(arr, key=lambda x: self._call_function(fn, [x], line), reverse=True)
            return sorted(arr, reverse=True)
        builtins['sortDesc'] = SdevBuiltin('sortDesc', sortDesc, 1, 2)
        
        def unique(args, line):
            if len(args) != 1:
                raise SdevError('unique() takes 1 argument', line)
            arr = args[0]
            if not isinstance(arr, list):
                raise SdevError('Argument must be a list', line)
            seen = []
            result = []
            for item in arr:
                if item not in seen:
                    seen.append(item)
                    result.append(item)
            return result
        builtins['unique'] = SdevBuiltin('unique', unique, 1, 1)
        
        def count(args, line):
            if len(args) != 2:
                raise SdevError('count() takes 2 arguments', line)
            arr = args[0]
            item = args[1]
            if not isinstance(arr, list):
                raise SdevError('First argument must be a list', line)
            return arr.count(item)
        builtins['count'] = SdevBuiltin('count', count, 2, 2)
        
        # ========== Set Operations ==========
        def union(args, line):
            if len(args) != 2:
                raise SdevError('union() takes 2 arguments', line)
            a, b = args[0], args[1]
            if not isinstance(a, list) or not isinstance(b, list):
                raise SdevError('Arguments must be lists', line)
            result = a.copy()
            for item in b:
                if item not in result:
                    result.append(item)
            return result
        builtins['union'] = SdevBuiltin('union', union, 2, 2)
        
        def intersect(args, line):
            if len(args) != 2:
                raise SdevError('intersect() takes 2 arguments', line)
            a, b = args[0], args[1]
            if not isinstance(a, list) or not isinstance(b, list):
                raise SdevError('Arguments must be lists', line)
            return [item for item in a if item in b]
        builtins['intersect'] = SdevBuiltin('intersect', intersect, 2, 2)
        
        def difference(args, line):
            if len(args) != 2:
                raise SdevError('difference() takes 2 arguments', line)
            a, b = args[0], args[1]
            if not isinstance(a, list) or not isinstance(b, list):
                raise SdevError('Arguments must be lists', line)
            return [item for item in a if item not in b]
        builtins['difference'] = SdevBuiltin('difference', difference, 2, 2)
        
        # ========== JSON ==========
        def etch(args, line):
            if len(args) < 1 or len(args) > 2:
                raise SdevError('etch() takes 1 or 2 arguments', line)
            indent = None
            if len(args) == 2:
                indent = int(args[1])
            return json.dumps(args[0], indent=indent, default=str)
        builtins['etch'] = SdevBuiltin('etch', etch, 1, 2)
        
        def unetch(args, line):
            if len(args) != 1:
                raise SdevError('unetch() takes 1 argument', line)
            try:
                return json.loads(args[0])
            except json.JSONDecodeError as e:
                raise SdevError(f'Invalid JSON: {e}', line)
        builtins['unetch'] = SdevBuiltin('unetch', unetch, 1, 1)
        
        # ========== File I/O ==========
        def inscribe(args, line):
            if len(args) != 2:
                raise SdevError('inscribe() takes 2 arguments (path, content)', line)
            path = args[0]
            content = self._stringify(args[1])
            try:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                return True
            except Exception as e:
                raise SdevError(f"Failed to write file: {e}", line)
        builtins['inscribe'] = SdevBuiltin('inscribe', inscribe, 2, 2)
        
        def decipher(args, line):
            if len(args) != 1:
                raise SdevError('decipher() takes 1 argument (path)', line)
            path = args[0]
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    return f.read()
            except Exception as e:
                raise SdevError(f"Failed to read file: {e}", line)
        builtins['decipher'] = SdevBuiltin('decipher', decipher, 1, 1)
        
        def appendFile(args, line):
            if len(args) != 2:
                raise SdevError('appendFile() takes 2 arguments', line)
            path = args[0]
            content = self._stringify(args[1])
            try:
                with open(path, 'a', encoding='utf-8') as f:
                    f.write(content)
                return True
            except Exception as e:
                raise SdevError(f"Failed to append to file: {e}", line)
        builtins['appendFile'] = SdevBuiltin('appendFile', appendFile, 2, 2)
        
        def fileExists(args, line):
            if len(args) != 1:
                raise SdevError('fileExists() takes 1 argument', line)
            return os.path.exists(args[0])
        builtins['fileExists'] = SdevBuiltin('fileExists', fileExists, 1, 1)
        
        def deleteFile(args, line):
            if len(args) != 1:
                raise SdevError('deleteFile() takes 1 argument', line)
            try:
                os.remove(args[0])
                return True
            except Exception as e:
                raise SdevError(f"Failed to delete file: {e}", line)
        builtins['deleteFile'] = SdevBuiltin('deleteFile', deleteFile, 1, 1)
        
        def listDir(args, line):
            if len(args) != 1:
                raise SdevError('listDir() takes 1 argument', line)
            try:
                return os.listdir(args[0])
            except Exception as e:
                raise SdevError(f"Failed to list directory: {e}", line)
        builtins['listDir'] = SdevBuiltin('listDir', listDir, 1, 1)
        
        # ========== Networking ==========
        def fetch(args, line):
            if len(args) < 1:
                raise SdevError('fetch() takes 1 or 2 arguments', line)
            url = args[0]
            options = args[1] if len(args) > 1 else {}
            try:
                method = options.get('method', 'GET') if isinstance(options, dict) else 'GET'
                headers = options.get('headers', {}) if isinstance(options, dict) else {}
                body = options.get('body') if isinstance(options, dict) else None
                
                req = urllib.request.Request(url, method=method)
                for key, value in headers.items():
                    req.add_header(key, value)
                
                if body:
                    if isinstance(body, (dict, list)):
                        body = json.dumps(body).encode('utf-8')
                        req.add_header('Content-Type', 'application/json')
                    else:
                        body = str(body).encode('utf-8')
                    req.data = body
                
                with urllib.request.urlopen(req, timeout=30) as response:
                    content = response.read().decode('utf-8')
                    try:
                        return json.loads(content)
                    except json.JSONDecodeError:
                        return content
            except urllib.error.URLError as e:
                raise SdevError(f"Network error: {e}", line)
            except Exception as e:
                raise SdevError(f"Fetch failed: {e}", line)
        builtins['fetch'] = SdevBuiltin('fetch', fetch, 1, 2)
        
        # ========== Date/Time ==========
        import time as time_module
        import datetime
        
        def now(args, line):
            return time_module.time()
        builtins['now'] = SdevBuiltin('now', now, 0, 0)
        
        def timestamp(args, line):
            return int(time_module.time() * 1000)
        builtins['timestamp'] = SdevBuiltin('timestamp', timestamp, 0, 0)
        
        def formatTime(args, line):
            if len(args) < 1:
                raise SdevError('formatTime() takes 1 or 2 arguments', line)
            ts = args[0]
            fmt = args[1] if len(args) > 1 else '%Y-%m-%d %H:%M:%S'
            return datetime.datetime.fromtimestamp(ts).strftime(fmt)
        builtins['formatTime'] = SdevBuiltin('formatTime', formatTime, 1, 2)
        
        def sleep(args, line):
            if len(args) != 1:
                raise SdevError('sleep() takes 1 argument', line)
            time_module.sleep(args[0])
            return None
        builtins['sleep'] = SdevBuiltin('sleep', sleep, 1, 1)
        
        # ========== Utility ==========
        def version(args, line):
            return __version__
        builtins['version'] = SdevBuiltin('version', version, 0, 0)
        
        def exit_fn(args, line):
            code = int(args[0]) if len(args) > 0 else 0
            sys.exit(code)
        builtins['exit'] = SdevBuiltin('exit', exit_fn, 0, 1)
        
        def input_fn(args, line):
            prompt = self._stringify(args[0]) if len(args) > 0 else ''
            return input(prompt)
        builtins['input'] = SdevBuiltin('input', input_fn, 0, 1)
        
        def debug(args, line):
            """Print debug info about a value"""
            for arg in args:
                self.output(f"[DEBUG] Type: {self._get_type(arg)}, Value: {self._stringify(arg)}")
            return None
        builtins['debug'] = SdevBuiltin('debug', debug)
        
        def assert_fn(args, line):
            if len(args) < 1:
                raise SdevError('assert() takes at least 1 argument', line)
            condition = args[0]
            message = args[1] if len(args) > 1 else 'Assertion failed'
            if not self._is_truthy(condition):
                raise SdevError(str(message), line)
            return True
        builtins['assert'] = SdevBuiltin('assert', assert_fn, 1, 2)
        
        # ========== Ternary helper ==========
        def ternary(args, line):
            if len(args) != 3:
                raise SdevError('Invalid ternary expression', line)
            return args[1] if self._is_truthy(args[0]) else args[2]
        builtins['__ternary__'] = SdevBuiltin('__ternary__', ternary, 3, 3)
        
        return builtins
    
    def _get_type(self, value: Any) -> str:
        if value is None:
            return 'void'
        if isinstance(value, bool):
            return 'truth'
        if isinstance(value, (int, float)):
            return 'number'
        if isinstance(value, str):
            return 'text'
        if isinstance(value, list):
            return 'list'
        if isinstance(value, dict):
            return 'tome'
        if isinstance(value, (SdevBuiltin, SdevUserFunc, SdevLambda)):
            return 'conjuration'
        return 'mystery'
    
    def _call_function(self, func: Any, args: List[Any], line: int) -> Any:
        if isinstance(func, SdevBuiltin):
            return func.func(args, line)
        if isinstance(func, SdevUserFunc):
            return self._call_user_func(func, args, line)
        if isinstance(func, SdevLambda):
            return self._call_lambda(func, args, line)
        raise SdevError('Cannot call non-function', line)
    
    def _call_user_func(self, func: SdevUserFunc, args: List[Any], line: int) -> Any:
        if len(args) != len(func.params):
            raise SdevError(f"Function '{func.name}' expects {len(func.params)} arguments, got {len(args)}", line)
        func_env = Environment(func.closure)
        for i, param in enumerate(func.params):
            func_env.define(param, args[i])
        try:
            self._execute(func.body, func_env)
            return None
        except ReturnException as e:
            return e.value
    
    def _call_lambda(self, func: SdevLambda, args: List[Any], line: int) -> Any:
        if len(args) != len(func.params):
            raise SdevError(f"Lambda expects {len(func.params)} arguments, got {len(args)}", line)
        lambda_env = Environment(func.closure)
        for i, param in enumerate(func.params):
            lambda_env.define(param, args[i])
        return self._execute(func.body, lambda_env)
    
    def interpret(self, program: Program) -> Any:
        result = None
        for stmt in program.statements:
            result = self._execute(stmt, self.global_env)
        return result
    
    def _execute(self, node: ASTNode, env: Environment) -> Any:
        if isinstance(node, Program):
            result = None
            for stmt in node.statements:
                result = self._execute(stmt, env)
            return result
        
        if isinstance(node, NumberLiteral):
            return node.value
        if isinstance(node, StringLiteral):
            return node.value
        if isinstance(node, BooleanLiteral):
            return node.value
        if isinstance(node, NullLiteral):
            return None
        if isinstance(node, Identifier):
            return env.get(node.name, node.line)
        
        if isinstance(node, BinaryExpr):
            return self._execute_binary(node, env)
        if isinstance(node, UnaryExpr):
            return self._execute_unary(node, env)
        if isinstance(node, CallExpr):
            return self._execute_call(node, env)
        if isinstance(node, IndexExpr):
            return self._execute_index(node, env)
        if isinstance(node, SliceExpr):
            return self._execute_slice(node, env)
        if isinstance(node, MemberExpr):
            return self._execute_member(node, env)
        if isinstance(node, ArrayLiteral):
            return [self._execute(el, env) for el in node.elements]
        if isinstance(node, DictLiteral):
            return self._execute_dict(node, env)
        if isinstance(node, LambdaExpr):
            return SdevLambda(node.params, node.body, env)
        
        if isinstance(node, LetStatement):
            value = self._execute(node.value, env)
            env.define(node.name, value)
            return None
        if isinstance(node, AssignStatement):
            value = self._execute(node.value, env)
            env.set(node.name, value, node.line)
            return value
        if isinstance(node, IndexAssignStatement):
            return self._execute_index_assign(node, env)
        if isinstance(node, MemberAssignStatement):
            return self._execute_member_assign(node, env)
        if isinstance(node, IfStatement):
            return self._execute_if(node, env)
        if isinstance(node, WhileStatement):
            return self._execute_while(node, env)
        if isinstance(node, ForInStatement):
            return self._execute_for_in(node, env)
        if isinstance(node, TryStatement):
            return self._execute_try(node, env)
        if isinstance(node, FuncDeclaration):
            return self._execute_func_decl(node, env)
        if isinstance(node, ReturnStatement):
            value = self._execute(node.value, env) if node.value else None
            raise ReturnException(value)
        if isinstance(node, BreakStatement):
            raise BreakException()
        if isinstance(node, ContinueStatement):
            raise ContinueException()
        if isinstance(node, BlockStatement):
            return self._execute_block(node, env)
        if isinstance(node, ExpressionStatement):
            return self._execute(node.expression, env)
        
        raise SdevError(f"Unknown node type: {type(node).__name__}", getattr(node, 'line', 0))
    
    def _execute_binary(self, node: BinaryExpr, env: Environment) -> Any:
        # Short-circuit for also/either
        if node.operator == 'also':
            left = self._execute(node.left, env)
            if not self._is_truthy(left):
                return left
            return self._execute(node.right, env)
        if node.operator == 'either':
            left = self._execute(node.left, env)
            if self._is_truthy(left):
                return left
            return self._execute(node.right, env)
        
        left = self._execute(node.left, env)
        right = self._execute(node.right, env)
        
        op = node.operator
        if op == '+':
            if isinstance(left, (int, float)) and isinstance(right, (int, float)):
                return left + right
            if isinstance(left, str) or isinstance(right, str):
                return self._stringify(left) + self._stringify(right)
            if isinstance(left, list) and isinstance(right, list):
                return left + right
            raise SdevError("Cannot use '+' with these types", node.line)
        if op == '-':
            if isinstance(left, (int, float)) and isinstance(right, (int, float)):
                return left - right
            raise SdevError("Cannot use '-' with non-numbers", node.line)
        if op == '*':
            if isinstance(left, (int, float)) and isinstance(right, (int, float)):
                return left * right
            if isinstance(left, str) and isinstance(right, (int, float)):
                return left * int(right)
            if isinstance(left, (int, float)) and isinstance(right, str):
                return right * int(left)
            if isinstance(left, list) and isinstance(right, (int, float)):
                return left * int(right)
            raise SdevError("Cannot use '*' with these types", node.line)
        if op == '/':
            if isinstance(left, (int, float)) and isinstance(right, (int, float)):
                if right == 0:
                    raise SdevError('Division by zero', node.line)
                return left / right
            raise SdevError("Cannot use '/' with non-numbers", node.line)
        if op == '%':
            if isinstance(left, (int, float)) and isinstance(right, (int, float)):
                return left % right
            raise SdevError("Cannot use '%' with non-numbers", node.line)
        if op == '^':
            if isinstance(left, (int, float)) and isinstance(right, (int, float)):
                return left ** right
            raise SdevError("Cannot use '^' with non-numbers", node.line)
        if op == '<':
            return left < right
        if op == '>':
            return left > right
        if op == '<=':
            return left <= right
        if op == '>=':
            return left >= right
        if op == 'equals':
            return self._is_equal(left, right)
        if op == 'differs' or op == '<>':
            return not self._is_equal(left, right)
        
        raise SdevError(f"Unknown operator: {op}", node.line)
    
    def _execute_unary(self, node: UnaryExpr, env: Environment) -> Any:
        operand = self._execute(node.operand, env)
        
        if node.operator == '-':
            if not isinstance(operand, (int, float)):
                raise SdevError("Cannot negate non-number", node.line)
            return -operand
        if node.operator == 'isnt':
            return not self._is_truthy(operand)
        
        raise SdevError(f"Unknown unary operator: {node.operator}", node.line)
    
    def _execute_call(self, node: CallExpr, env: Environment) -> Any:
        callee = self._execute(node.callee, env)
        args = [self._execute(arg, env) for arg in node.args]
        
        if isinstance(callee, SdevBuiltin):
            return callee.func(args, node.line)
        if isinstance(callee, SdevUserFunc):
            return self._call_user_func(callee, args, node.line)
        if isinstance(callee, SdevLambda):
            return self._call_lambda(callee, args, node.line)
        
        raise SdevError('Cannot call non-function', node.line)
    
    def _execute_index(self, node: IndexExpr, env: Environment) -> Any:
        obj = self._execute(node.obj, env)
        index = self._execute(node.index, env)
        
        if isinstance(obj, list):
            if not isinstance(index, (int, float)):
                raise SdevError('List index must be a number', node.line)
            idx = int(index)
            if idx < -len(obj) or idx >= len(obj):
                raise SdevError('List index out of bounds', node.line)
            return obj[idx]
        
        if isinstance(obj, str):
            if not isinstance(index, (int, float)):
                raise SdevError('String index must be a number', node.line)
            idx = int(index)
            if idx < -len(obj) or idx >= len(obj):
                raise SdevError('String index out of bounds', node.line)
            return obj[idx]
        
        if isinstance(obj, dict):
            key = self._stringify(index) if not isinstance(index, str) else index
            return obj.get(key)
        
        raise SdevError('Cannot index this type', node.line)
    
    def _execute_slice(self, node: SliceExpr, env: Environment) -> Any:
        obj = self._execute(node.obj, env)
        start = self._execute(node.start, env) if node.start else None
        end = self._execute(node.end, env) if node.end else None
        step = self._execute(node.step, env) if node.step else None
        
        if isinstance(obj, (list, str)):
            start = int(start) if start is not None else None
            end = int(end) if end is not None else None
            step = int(step) if step is not None else None
            return obj[start:end:step]
        
        raise SdevError('Cannot slice this type', node.line)
    
    def _execute_member(self, node: MemberExpr, env: Environment) -> Any:
        obj = self._execute(node.obj, env)
        
        if isinstance(obj, dict):
            return obj.get(node.property)
        
        raise SdevError('Cannot access property on this type', node.line)
    
    def _execute_dict(self, node: DictLiteral, env: Environment) -> Dict[str, Any]:
        result = {}
        for key_node, value_node in node.entries:
            key = self._execute(key_node, env)
            value = self._execute(value_node, env)
            result[self._stringify(key)] = value
        return result
    
    def _execute_index_assign(self, node: IndexAssignStatement, env: Environment) -> Any:
        obj = self._execute(node.obj, env)
        index = self._execute(node.index, env)
        value = self._execute(node.value, env)
        
        if isinstance(obj, list):
            if not isinstance(index, (int, float)):
                raise SdevError('List index must be a number', node.line)
            idx = int(index)
            if idx < -len(obj) or idx >= len(obj):
                raise SdevError('List index out of bounds', node.line)
            obj[idx] = value
            return value
        
        if isinstance(obj, dict):
            key = self._stringify(index) if not isinstance(index, str) else index
            obj[key] = value
            return value
        
        raise SdevError('Cannot assign to index of this type', node.line)
    
    def _execute_member_assign(self, node: MemberAssignStatement, env: Environment) -> Any:
        obj = self._execute(node.obj, env)
        value = self._execute(node.value, env)
        
        if isinstance(obj, dict):
            obj[node.property] = value
            return value
        
        raise SdevError('Cannot assign property on this type', node.line)
    
    def _execute_if(self, node: IfStatement, env: Environment) -> Any:
        condition = self._execute(node.condition, env)
        
        if self._is_truthy(condition):
            return self._execute(node.then_branch, env)
        elif node.else_branch:
            return self._execute(node.else_branch, env)
        
        return None
    
    def _execute_while(self, node: WhileStatement, env: Environment) -> Any:
        result = None
        iterations = 0
        
        while self._is_truthy(self._execute(node.condition, env)):
            try:
                result = self._execute(node.body, env)
            except BreakException:
                break
            except ContinueException:
                pass
            
            iterations += 1
            if iterations > self.max_iterations:
                raise SdevError('Maximum loop iterations exceeded (possible infinite loop)', node.line)
        
        return result
    
    def _execute_for_in(self, node: ForInStatement, env: Environment) -> Any:
        iterable = self._execute(node.iterable, env)
        result = None
        
        if not isinstance(iterable, (list, str, dict)):
            raise SdevError('Can only iterate over list, text, or tome', node.line)
        
        items = iterable
        if isinstance(iterable, dict):
            items = list(iterable.keys())
        
        for item in items:
            loop_env = Environment(env)
            loop_env.define(node.var_name, item)
            try:
                result = self._execute(node.body, loop_env)
            except BreakException:
                break
            except ContinueException:
                continue
        
        return result
    
    def _execute_try(self, node: TryStatement, env: Environment) -> Any:
        try:
            return self._execute(node.try_block, env)
        except SdevError as e:
            if node.catch_block:
                catch_env = Environment(env)
                if node.error_var:
                    catch_env.define(node.error_var, str(e))
                return self._execute(node.catch_block, catch_env)
            return None
    
    def _execute_func_decl(self, node: FuncDeclaration, env: Environment) -> None:
        func = SdevUserFunc(node.name, node.params, node.body, env)
        env.define(node.name, func)
    
    def _execute_block(self, node: BlockStatement, env: Environment) -> Any:
        block_env = Environment(env)
        result = None
        for stmt in node.statements:
            result = self._execute(stmt, block_env)
        return result
    
    def _is_truthy(self, value: Any) -> bool:
        if value is None:
            return False
        if isinstance(value, bool):
            return value
        if isinstance(value, (int, float)):
            return value != 0
        if isinstance(value, str):
            return len(value) > 0
        if isinstance(value, list):
            return len(value) > 0
        return True
    
    def _is_equal(self, a: Any, b: Any) -> bool:
        if a is None and b is None:
            return True
        if a is None or b is None:
            return False
        if isinstance(a, list) and isinstance(b, list):
            if len(a) != len(b):
                return False
            return all(self._is_equal(x, y) for x, y in zip(a, b))
        return a == b
    
    def _stringify(self, value: Any) -> str:
        if value is None:
            return 'void'
        if isinstance(value, bool):
            return 'yep' if value else 'nope'
        if isinstance(value, float):
            if value == int(value):
                return str(int(value))
            return str(value)
        if isinstance(value, (SdevBuiltin, SdevUserFunc, SdevLambda)):
            return '<conjuration>'
        if isinstance(value, list):
            return '[' + ', '.join(self._stringify(v) for v in value) + ']'
        if isinstance(value, dict):
            entries = ', '.join(f'{k}: {self._stringify(v)}' for k, v in value.items())
            return ':: ' + entries + ' ;;'
        return str(value)

# ============= Public API =============

def execute(source: str, output_callback: Callable[[str], None] = print) -> Any:
    """Execute sdev source code and return the result"""
    lexer = Lexer(source)
    tokens = lexer.tokenize()
    parser = Parser(tokens)
    program = parser.parse()
    interpreter = Interpreter(output_callback)
    return interpreter.interpret(program)

def run_file(path: str) -> None:
    """Run a sdev file"""
    try:
        with open(path, 'r', encoding='utf-8') as f:
            source = f.read()
        execute(source)
    except FileNotFoundError:
        print(f"Error: File not found: {path}")
        sys.exit(1)
    except SdevError as e:
        print(f"Error: {e}")
        sys.exit(1)

def repl() -> None:
    """Start the sdev REPL"""
    print(f"sdev {__version__} - Interactive REPL")
    print("Type 'exit()' or Ctrl+C to quit\n")
    
    interpreter = Interpreter()
    
    while True:
        try:
            line = input("sdev> ")
            if not line.strip():
                continue
            
            # Multi-line input
            while line.count('::') > line.count(';;'):
                line += '\n' + input("...   ")
            
            lexer = Lexer(line)
            tokens = lexer.tokenize()
            parser = Parser(tokens)
            program = parser.parse()
            result = interpreter.interpret(program)
            
            if result is not None:
                print(interpreter._stringify(result))
                
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except EOFError:
            print("\nGoodbye!")
            break
        except SdevError as e:
            print(f"Error: {e}")
        except Exception as e:
            print(f"Internal error: {e}")

# ============= Main Entry Point =============

if __name__ == '__main__':
    if len(sys.argv) > 1:
        run_file(sys.argv[1])
    else:
        repl()
